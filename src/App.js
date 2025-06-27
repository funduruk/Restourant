import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import tableImage from './assets/table.png';
import plitkaImage from './assets/plitka.png';
import Menu from './Menu';
import Staff from './Staff';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const supabase = createClient('https://qcplkvsesufkxfkgdach.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcGxrdnNlc3Vma3hma2dkYWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Nzc3MjgsImV4cCI6MjA2NTQ1MzcyOH0.6mL2jqZY5AzGHhvxI3EKQhIMBeXIxHW5-U9zfrjTRIQ'); // Замените на реальные значения

function Tables() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [clientName, setClientName] = useState('');
    const [phone, setPhone] = useState('');
    const timeSlots = ['10:00-12:00', '13:00-15:00', '16:00-18:00', '19:00-21:00', '22:00-23:00'];
    const [bookedSlots, setBookedSlots] = useState({}); // Хранит занятые слоты по table_id

    useEffect(() => {
        fetchTables();
    }, [selectedDate]); // Обновляем только при изменении даты

    async function fetchTables() {
        const formattedDate = selectedDate.toISOString().split('T')[0];

        try {
            console.log('Fetching reservations for date:', formattedDate); // Отладка
            const { data: reservations, error: reservationError } = await supabase
                .from('reservation')
                .select('table_id, time_slot')
                .eq('reservation_date', formattedDate);

            if (reservationError) {
                console.error('Error fetching reservations:', reservationError);
            } else {
                console.log('Fetched reservations:', reservations); // Отладка
                const slots = {};
                reservations.forEach(res => {
                    if (!slots[res.table_id]) slots[res.table_id] = new Set();
                    slots[res.table_id].add(res.time_slot);
                });
                setBookedSlots(slots);
                console.log('Updated bookedSlots:', slots); // Отладка
            }

            const { data, error } = await supabase
                .from('tables')
                .select('table_id, type, count_seats, status');
            if (error) {
                console.error('Error fetching tables:', error);
            } else {
                setTables(data || []);
            }
        } catch (error) {
            console.error('Unexpected error fetching tables:', error);
        }
    }

    const handleTableClick = (table) => {
        setSelectedTable(table);
        setSelectedTimeSlot(''); // Сбрасываем выбор времени при выборе нового стола
    };

    const handleReservation = async () => {
        if (!selectedTable || !selectedTimeSlot || !clientName || !phone) {
            console.error('Please fill all fields');
            return;
        }

        const formattedDate = selectedDate.toISOString().split('T')[0];
        // Проверка на повторную бронь
        if (bookedSlots[selectedTable.table_id]?.has(selectedTimeSlot)) {
            console.error('This time slot is already booked for this table!');
            return;
        }

        try {
            console.log('Inserting reservation:', {
                client_name: clientName,
                number_phone_client: phone,
                table_id: selectedTable.table_id,
                reservation_date: formattedDate,
                time_slot: selectedTimeSlot,
            });
            const { error, data } = await supabase
                .from('reservation')
                .insert({
                    client_name: clientName,
                    number_phone_client: phone,
                    table_id: selectedTable.table_id,
                    reservation_date: formattedDate,
                    time_slot: selectedTimeSlot,
                });
            if (error) {
                if (error.code === '404') {
                    console.error('Resource not found (404). Check if the reservation table exists and anon key has access:', error.message);
                } else if (error.code === '42883') {
                    console.error('Type mismatch error with time_slot. Ensure the value matches the enum definition:', error.message);
                    console.error('Current time_slot value:', selectedTimeSlot);
                    console.error('Enum values should be:', ['10:00-12:00', '13:00-15:00', '16:00-18:00', '19:00-21:00', '22:00-23:00']);
                } else {
                    console.error('Reservation error:', error);
                }
            } else {
                console.log('Reservation data:', data);
                alert('Table booked successfully!');
                setSelectedTable(null);
                setSelectedTimeSlot('');
                setClientName('');
                setPhone('');
                fetchTables(); // Обновляем данные после брони
            }
        } catch (error) {
            console.error('Unexpected error during reservation:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            {/* Header */}
            <header className="bg-yellow-500 text-white p-4 text-center">
                <nav className="flex justify-between">
                    <Link to="/menu" className="font-[cursive]">Menu</Link>
                    <Link to="/" className="text-4xl font-[cursive]">Mangia Bene</Link>
                    <Link to="/staff" className="font-[cursive]">Staff</Link>
                </nav>
            </header>

            {/* Tables Section */}
            <section className="bg-yellow-300 text-center py-2">
                <h2 className="text-xl font-playfair">Tables</h2>
            </section>

            <main>
                <div
                    className="flex flex-wrap gap-4"
                    style={{
                        backgroundImage: `url(${plitkaImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'repeat',
                    }}
                >
                    {tables.length > 0 ? (
                        tables.map(table => (
                            <img
                                key={table.table_id}
                                src={tableImage}
                                alt={`Table ${table.table_id}`}
                                className={`w-30 h-20 cursor-pointer ${table.status === 'booked' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleTableClick(table)}
                            />
                        ))
                    ) : (
                        <p>No tables available</p>
                    )}
                </div>

                {selectedTable && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded shadow-lg w-[300px]">
                            <h3 className="text-xl font-playfair">Book Table {selectedTable.table_id}</h3>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                className="border p-2 rounded w-full mb-2"
                            />
                            <div className="mb-2">
                                {timeSlots.map(slot => {
                                    const isBooked = bookedSlots[selectedTable.table_id]?.has(slot) || false;
                                    return (
                                        <button
                                            key={slot}
                                            className={`block w-full text-left p-1 ${selectedTimeSlot === slot ? 'text-blue-500' : isBooked ? 'text-red-500' : 'text-black hover:text-gray-700'} ${isBooked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            onClick={() => !isBooked && setSelectedTimeSlot(slot)}
                                            disabled={isBooked}
                                        >
                                            {slot} {isBooked ? '(Booked)' : ''}
                                        </button>
                                    );
                                })}
                            </div>
                            <input
                                type="text"
                                placeholder="Client Name"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="border p-2 rounded w-full mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="border p-2 rounded w-full mb-2"
                            />
                            {selectedTimeSlot && (
                                <button
                                    className="bg-gold text-white p-2 rounded w-full"
                                    onClick={handleReservation}
                                >
                                    ORDER
                                </button>
                            )}
                            <button
                                className="bg-gray-300 text-black p-2 rounded mt-2 w-full"
                                onClick={() => {
                                    setSelectedTable(null);
                                    setSelectedTimeSlot('');
                                    setClientName('');
                                    setPhone('');
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Tables />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/staff" element={<Staff />} />
            </Routes>
        </Router>
    );
}

export default App;