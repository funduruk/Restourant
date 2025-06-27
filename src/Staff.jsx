import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import plitkaImage from './assets/plitka.png';
import tableImage from './assets/table.png';
import DatePicker from "react-datepicker";

const supabase = createClient('https://qcplkvsesufkxfkgdach.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcGxrdnNlc3Vma3hma2dkYWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Nzc3MjgsImV4cCI6MjA2NTQ1MzcyOH0.6mL2jqZY5AzGHhvxI3EKQhIMBeXIxHW5-U9zfrjTRIQ');

function Staff() {
    const [accessCode, setAccessCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [waiter, setWaiter] = useState(null);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [dishes, setDishes] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [error, setError] = useState('');
    const [report, setReport] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const navigate = useNavigate();

    const timeSlots = ['10:00-12:00', '13:00-15:00', '16:00-18:00', '19:00-21:00', '22:00-23:00'];
    const [bookedSlots, setBookedSlots] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            fetchTables();
            fetchDishes();
            fetchIngredients();
            fetchWaiterShifts();
        }
    }, [isAuthenticated, selectedDate, selectedTimeSlot]);

    const handleLogin = async () => {
        try {
            const { data, error } = await supabase
                .from('waiters')
                .select('waiter_id, first_name, last_name')
                .eq('access_code', accessCode)
                .single();

            if (error || !data) {
                setError('Invalid access code');
            } else {
                setError('');
                setWaiter(data);
                setIsAuthenticated(true);
            }
        } catch (err) {
            setError('Error verifying access code');
        }
    };

    async function fetchTables() {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        try {
            const { data: reservations, error: reservationError } = await supabase
                .from('reservation')
                .select('table_id, time_slot')
                .eq('reservation_date', formattedDate);

            if (reservationError) {
                console.error('Error fetching reservations:', reservationError.message);
            } else {
                const slots = {};
                reservations.forEach(res => {
                    if (!slots[res.table_id]) slots[res.table_id] = new Set();
                    slots[res.table_id].add(res.time_slot);
                });
                setBookedSlots(slots);
            }

            const { data, error } = await supabase
                .from('tables')
                .select('table_id, type, status, count_seats');
            if (error) {
                console.error('Error fetching tables:', error);
            } else {
                setTables(data || []);
            }
        } catch (error) {
            console.error('Unexpected error fetching tables:', error);
        }
    }

    async function fetchDishes() {
        try {
            const { data, error } = await supabase
                .from('dishes')
                .select('dish_id, name, price, category, status')
                .eq('status', 'available');

            if (error) {
                console.error('Error fetching dishes:', error);
            } else {
                setDishes(data || []);
            }
        } catch (error) {
            console.error('Unexpected error fetching dishes:', error);
        }
    }

    async function fetchIngredients() {
        try {
            const { data, error } = await supabase
                .from('ingredients')
                .select('ingredient_id, name, quantity');
            if (error) {
                console.error('Error fetching ingredients:', error);
            } else {
                setIngredients(data || []);
            }
        } catch (error) {
            console.error('Unexpected error fetching ingredients:', error);
        }
    }

    async function fetchWaiterShifts() {
        if (waiter) {
            const { data, error } = await supabase
                .from('shifts')
                .select('shift_datetime')
                .eq('waiter_id', waiter.waiter_id)
                .order('shift_datetime', { ascending: false });

            if (error) {
                console.error('Error fetching shifts:', error);
            } else {
                console.log('Waiter shifts:', data);
            }
        }
    }

    const handleReservation = async () => {
        if (!selectedTable || !selectedTimeSlot) {
            setError('Please select a table and time slot');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const selected = selectedDate.toISOString().split('T')[0];
        if (selected < today) {
            setError('Cannot book tables for past dates!');
            return;
        }

        const formattedDate = selectedDate.toISOString().split('T')[0];
        if (bookedSlots[selectedTable.table_id]?.has(selectedTimeSlot)) {
            setError('This table is already booked for the selected time slot!');
            return;
        }

        try {
            const { error } = await supabase
                .from('reservation')
                .insert({
                    client_name: `Staff Reservation by ${waiter?.first_name} ${waiter?.last_name}`,
                    table_id: selectedTable.table_id,
                    reservation_date: formattedDate,
                    time_slot: selectedTimeSlot,
                });
            if (error) {
                setError(`Reservation error: ${error.message} (Code: ${error.code})`);
                console.error('Reservation error details:', error);
            } else {
                setError('');
                alert('Table booked successfully!');
                setSelectedTable(null);
                setSelectedTimeSlot('');
                fetchTables();
            }
        } catch (error) {
            setError('Unexpected error during reservation:', error.message);
            console.error('Unexpected error:', error);
        }
    };

    const addToOrder = (dish) => {
        if (!selectedTable) {
            setError('Please select a table first');
            return;
        }
        const existingItem = orderItems.find(item => item.dish_id === dish.dish_id);
        if (existingItem) {
            setOrderItems(orderItems.map(item =>
                item.dish_id === dish.dish_id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setOrderItems([...orderItems, { ...dish, quantity: 1 }]);
        }
    };

    const submitOrder = async () => {
        if (orderItems.length === 0 || !selectedTable) {
            setError('Please select a table and add items to order');
            return;
        }

        const requiredIngredients = await checkIngredients();
        if (!requiredIngredients.success) {
            setError(requiredIngredients.message);
            return;
        }

        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    table_id: selectedTable.table_id,
                    status: 'Accepted',
                    order_date: new Date().toISOString(),
                })
                .select('order_id')
                .single();

            if (orderError) {
                setError('Error creating order:', orderError.message);
                return;
            }

            const orderDetails = orderItems.map(item => ({
                order_id: order.order_id,
                dish_id: item.dish_id,
                quantity: item.quantity,
            }));

            const { error: detailsError } = await supabase
                .from('order_details')
                .insert(orderDetails);

            if (detailsError) {
                setError('Error adding order details:', detailsError.message);
            } else {
                await deductIngredients(orderDetails);
                setError('');
                setOrderItems([]); // Очищаем только текущий заказ
            }
        } catch (error) {
            setError('Unexpected error submitting order:', error.message);
        }
    };

        const closeTable = async () => {
            if (!selectedTable) {
                setError('Please select a table to close');
                return;
            }

            const now = new Date();
            const currentTimeSlot = timeSlots.find(slot => {
                const [start, end] = slot.split('-').map(t => {
                    const [hours, minutes] = t.split(':').map(Number);
                    return new Date(now.setHours(hours, minutes, 0, 0));
                });
                return now >= start && now <= end;
            }) || timeSlots[timeSlots.length - 1]; // По умолчанию последний слот

            try {
                // Получаем резервацию для текущего времени
                const { data: reservation, error: resError } = await supabase
                    .from('reservation')
                    .select('time_slot')
                    .eq('table_id', selectedTable.table_id)
                    .eq('reservation_date', now.toISOString().split('T')[0]);

                if (resError) {
                    setError(`Error fetching reservation: ${resError.message} (Code: ${resError.code})`);
                    console.error('Reservation error:', resError);
                    return;
                }

                if (!reservation || reservation.length === 0) {
                    setError('No active reservation found for this table');
                    return;
                }

                const activeReservation = reservation.find(r => r.time_slot === currentTimeSlot);
                if (!activeReservation) {
                    setError('Cannot close table outside current time slot');
                    return;
                }

                // Получаем все заказы для этого столика и time_slot
                const { data: orders, error: orderError } = await supabase
                    .from('orders')
                    .select('order_id')
                    .eq('table_id', selectedTable.table_id)
                    .gte('order_date', `${now.toISOString().split('T')[0]}T${currentTimeSlot.split('-')[0]}:00Z`)
                    .lte('order_date', `${now.toISOString().split('T')[0]}T${currentTimeSlot.split('-')[1]}:00Z`);

                if (orderError) {
                    setError('Error fetching orders:', orderError.message);
                    return;
                }

                if (orders.length === 0) {
                    setError('No orders found for this table in the current time slot');
                    return;
                }

                const orderIds = orders.map(o => o.order_id);
                const { data: allOrderDetails, error: detailsError } = await supabase
                    .from('order_details')
                    .select('dish_id, quantity')
                    .in('order_id', orderIds);

                if (detailsError) {
                    setError('Error fetching order details:', detailsError.message);
                    return;
                }

                const details = allOrderDetails.map(od => {
                    const dish = dishes.find(d => d.dish_id === od.dish_id);
                    return { name: dish?.name || 'Unknown', price: dish?.price || 0, quantity: od.quantity };
                });

                const total = details.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
                const receiptText = `
        **Mangia Bene Receipt**
        Table: ${selectedTable.table_id}
        Date: ${now.toLocaleDateString()}
        Time Slot: ${currentTimeSlot}
        Orders for this slot:

        ${details.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
        -----------------------
        Total: $${total}

        Thank you for your visit!
      `;
                setReceipt(receiptText);
                setTimeout(() => setReceipt(null), 10000);

                // Обновляем статус столика
                await supabase
                    .from('tables')
                    .update({ status: 'available' })
                    .eq('table_id', selectedTable.table_id);

                setSelectedTable(null);
                fetchTables();
            } catch (error) {
                setError('Unexpected error closing table:', error.message);
            }
        };


    async function checkIngredients() {
        const { data: dishIngredients, error } = await supabase
            .from('dish_ingredients')
            .select('dish_id, ingredient_id, required_quantity')
            .in('dish_id', orderItems.map(item => item.dish_id));

        if (error) {
            console.error('Error fetching dish ingredients:', error);
            return { success: false, message: 'Error checking ingredients' };
        }

        for (const item of orderItems) {
            const dishReq = dishIngredients.filter(di => di.dish_id === item.dish_id);
            for (const req of dishReq) {
                const ingredient = ingredients.find(i => i.ingredient_id === req.ingredient_id);
                if (!ingredient || ingredient.quantity < req.required_quantity * item.quantity) {
                    return { success: false, message: `Not enough ${ingredient?.name || 'ingredient'} for ${item.name}` };
                }
            }
        }
        return { success: true };
    }

    async function deductIngredients(orderDetails) {
        const { data: dishIngredients, error } = await supabase
            .from('dish_ingredients')
            .select('dish_id, ingredient_id, required_quantity');

        if (error) {
            console.error('Error fetching dish ingredients:', error);
            return;
        }

        for (const detail of orderDetails) {
            const dishReq = dishIngredients.filter(di => di.dish_id === detail.dish_id);
            for (const req of dishReq) {
                const ingredient = ingredients.find(i => i.ingredient_id === req.ingredient_id);
                if (ingredient) {
                    await supabase
                        .from('ingredients')
                        .update({ quantity: ingredient.quantity - (req.required_quantity * detail.quantity) })
                        .eq('ingredient_id', req.ingredient_id);
                }
            }
        }
        fetchIngredients();
    }

    const generateReport = async () => {
        const today = new Date().toISOString().split('T')[0];
        const monthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

        try {
            const { data: waiterTables, error: wtError } = await supabase
                .from('reservation')
                .select('table_id', { count: 'exact' })
                .eq('reservation_date', today)
                .eq('client_name', `Staff Reservation by ${waiter?.first_name} ${waiter?.last_name}`);

            if (wtError) throw wtError;

            const { data: soldDishes, error: sdError } = await supabase
                .from('order_details')
                .select('quantity')
                .gte('created_at', `${monthAgo}T00:00:00Z`);

            if (sdError) throw sdError;

            const dailyDishes = soldDishes.filter(od => od.created_at.split('T')[0] === today).reduce((sum, od) => sum + od.quantity, 0);
            const monthlyDishes = soldDishes.reduce((sum, od) => sum + od.quantity, 0);

            // Заменяем groupBy на агрегацию на клиенте
            const { data: allReservations, error: resError } = await supabase
                .from('reservation')
                .select('table_id')
                .gte('reservation_date', monthAgo)
                .lte('reservation_date', today);

            if (resError) throw resError;

            const tablesMonthly = allReservations.reduce((acc, res) => {
                acc[res.table_id] = (acc[res.table_id] || 0) + 1;
                return acc;
            }, {});

            setReport({
                tablesToday: waiterTables.length || 0,
                dishesDaily: dailyDishes || 0,
                dishesMonthly: monthlyDishes || 0,
                tablesMonthly: Object.entries(tablesMonthly).map(([table_id, count]) => ({ table_id: parseInt(table_id), count })),
            });
        } catch (error) {
            setError(`Error generating report: ${error.message}`);
            console.error('Report error:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-500 flex items-center justify-center">
                <div className="bg-white p-6 rounded shadow-lg w-[300px]">
                    <h2 className="text-2xl font-[cursive] text-center mb-4">Staff Login</h2>
                    <input
                        type="text"
                        placeholder="Enter Access Code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="border p-2 rounded w-full mb-4"
                    />
                    <button
                        className="bg-yellow-500 text-white p-2 rounded w-full"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-500">
            <header className="bg-yellow-500 text-white p-4 text-center">
                <nav className="flex justify-between">
                    <Link to="/" className="font-[cursive]">Tables</Link>
                    <h1 className="text-4xl font-[cursive]">Mangia Bene Staff</h1>
                    <Link to="/menu" className="font-[cursive]">Menu</Link>
                </nav>
            </header>

            <section className="bg-yellow-300 text-white p-2 text-center">
                <h2 className="text-xl font-[cursive]">Welcome, {waiter?.first_name} {waiter?.last_name}</h2>
            </section>

            <main className="p-6" style={{
                backgroundImage: `url(${plitkaImage})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'repeat',
            }}>
                <div className="max-w-4xl mx-auto">
                    {/* Бронирование столика */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-yellow-500 mb-4">Book a Table</h3>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            className="border p-2 rounded w-full mb-2"
                            minDate={new Date()}
                        />
                        <div className="mb-2">
                            {timeSlots.map(slot => {
                                const isBooked = bookedSlots[selectedTable?.table_id]?.has(slot) || false;
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
                        <div className="flex flex-wrap justify-around mb-4 gap-6">
                            {tables.length > 0 ? (
                                tables.map(table => (
                                    <div
                                        key={table.table_id}
                                        className={`table-icon w-12 h-12 cursor-pointer ${table.status === 'booked' || table.status === 'occupied' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => handleTableClick(table)}
                                        style={{ backgroundImage: `url(${tableImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                ))
                            ) : (
                                <p className="text-white">No tables available</p>
                            )}
                        </div>
                        <button
                            className="bg-yellow-500 text-white p-2 rounded w-full"
                            onClick={handleReservation}
                            disabled={!selectedTable || !selectedTimeSlot}
                        >
                            Book Table
                        </button>
                    </div>

                    {/* Оформление заказа */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-yellow-500 mb-4">Place an Order</h3>
                        <p className="text-white mb-2">Select a table first to proceed with the order.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {dishes.map(dish => (
                                <button
                                    key={dish.dish_id}
                                    className="bg-white p-2 rounded shadow hover:bg-gray-100"
                                    onClick={() => addToOrder(dish)}
                                    disabled={dish.status !== 'available' || !selectedTable}
                                >
                                    {dish.name} - ${dish.price.toFixed(2)} {dish.status === 'unavailable' ? '(Unavailable)' : ''}
                                </button>
                            ))}
                        </div>
                        <h4 className="text-xl font-bold mb-2">Order Items for Table {selectedTable?.table_id || 'None'}</h4>
                        <ul className="list-disc pl-5 mb-4">
                            {orderItems.map((item, index) => (
                                <li key={item.dish_id} className="mb-2">{item.name} - ${item.price.toFixed(2)} x {item.quantity}</li>
                            ))}
                        </ul>
                        <button
                            className="bg-yellow-500 text-white p-2 rounded w-full"
                            onClick={submitOrder}
                            disabled={orderItems.length === 0 || !selectedTable}
                        >
                            Submit Order
                        </button>
                    </div>

                    {/* Закрытие столика */}
                    {selectedTable && (
                        <div className="mb-6">
                            <button
                                className="bg-red-500 text-white p-2 rounded w-full"
                                onClick={closeTable}
                            >
                                Close Table
                            </button>
                        </div>
                    )}

                    {/* Отчёты */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-yellow-500 mb-4">Generate Report</h3>
                        <button
                            className="bg-yellow-500 text-white p-2 rounded w-full mb-2"
                            onClick={generateReport}
                        >
                            Generate
                        </button>
                        {report && (
                            <div className="bg-white p-4 rounded shadow">
                                <h4 className="text-lg font-bold">Report for {waiter?.first_name} {waiter?.last_name}</h4>
                                <p>Tables served today: {report.tablesToday}</p>
                                <p>Dishes sold today: {report.dishesDaily}</p>
                                <p>Dishes sold this month: {report.dishesMonthly}</p>
                                <h5 className="text-md font-bold mt-2">Tables booked this month:</h5>
                                <ul>
                                    {report.tablesMonthly.map(t => (
                                        <li key={t.table_id}>Table {t.table_id}: {t.count} times</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Чек */}
                    {receipt && (
                        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-4 rounded shadow w-1/3">
                                <pre className="whitespace-pre-wrap">{receipt}</pre>
                                <button
                                    className="bg-yellow-500 text-white p-2 rounded mt-4 w-full"
                                    onClick={() => setReceipt(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
            </main>
        </div>
    );

    function handleTableClick(table) {
        setSelectedTable(table);
        setSelectedTimeSlot('');
    }
}

export default Staff;