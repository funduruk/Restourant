import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import plitkaImage from './assets/plitka.png';

const supabase = createClient('https://qcplkvsesufkxfkgdach.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcGxrdnNlc3Vma3hma2dkYWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Nzc3MjgsImV4cCI6MjA2NTQ1MzcyOH0.6mL2jqZY5AzGHhvxI3EKQhIMBeXIxHW5-U9zfrjTRIQ');

function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    async function fetchMenuItems() {
        try {
            const { data, error } = await supabase
                .from('dishes')
                .select('dish_id, name, price, category, status');

            if (error) {
                console.error('Error fetching menu items:', error);
            } else {
                setMenuItems(data || []);

                // Extract unique categories
                const uniqueCategories = ['All', ...new Set(data.map(item => item.category))];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Unexpected error fetching menu items:', error);
        }
    }

    const filteredItems = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-500">
            {/* Header */}
            <header className="bg-yellow-500 text-white p-4 text-center">
                <nav className="flex justify-between">
                    <a href="#" className="font-[cursive]">Menu</a>
                    <a href="/" className="text-4xl font-[cursive]">Mangia Bene</a>
                    <a href="#" className="font-[cursive]">About</a>
                </nav>
            </header>

            {/* Subheader */}
            <section className="bg-yellow-300 text-white p-2 text-center">
                <h2 className="text-xl font-[cursive]">Menu</h2>
            </section>

            {/* Main Content */}
            <main className="p-6" style={{
                backgroundImage: `url(${plitkaImage})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'repeat',
            }}>
                <div className="max-w-4xl mx-auto">
                    {/* Category Filter */}
                    <div className="mb-4">
                        <label htmlFor="categorySelect" className="mr-2 text-white font-[cursive]">Categories:</label>
                        <select
                            id="categorySelect"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="p-2 rounded bg-yellow-400 text-white font-[cursive]"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Menu Items */}
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div key={item.id} className="mb-4 p-4 bg-white rounded shadow">
                                <h3 className="text-xl font-bold">{item.name}</h3>
                                <p className="text-yellow-500">${item.price.toFixed(2)}</p>
                                <p className="text-gray-600">Category: {item.category}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-white">No items available</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Menu;