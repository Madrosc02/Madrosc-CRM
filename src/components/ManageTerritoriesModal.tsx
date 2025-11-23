import React, { useState, useEffect } from 'react';
import { Customer, CustomerTerritory, MonopolyStatus } from '../types';
import { indianStatesAndDistricts } from '../data/indianStatesAndDistricts';
import { fetchTerritoriesForCustomer, addTerritory, deleteTerritory } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Spinner from './ui/Spinner';

interface ManageTerritoriesModalProps {
    customer: Customer;
    isOpen: boolean;
    onClose: () => void;
    allCustomers: Customer[];
}

const ManageTerritoriesModal: React.FC<ManageTerritoriesModalProps> = ({ customer, isOpen, onClose, allCustomers }) => {
    const { addToast } = useToast();
    const [territories, setTerritories] = useState<CustomerTerritory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTerritory, setNewTerritory] = useState<Omit<CustomerTerritory, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>>({
        state: '',
        district: '',
        monopolyStatus: 'Non-Monopoly',
    });
    const [districts, setDistricts] = useState<string[]>([]);
    const [warning, setWarning] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadTerritories();
        }
    }, [isOpen, customer.id]);

    useEffect(() => {
        if (newTerritory.state && indianStatesAndDistricts[newTerritory.state]) {
            setDistricts(indianStatesAndDistricts[newTerritory.state]);
        } else {
            setDistricts([]);
        }
    }, [newTerritory.state]);

    // Check for monopoly conflicts
    useEffect(() => {
        if (newTerritory.monopolyStatus === 'Monopoly' && newTerritory.district) {
            // Check in territories table
            const existingInTerritories = territories.find(
                t => t.district === newTerritory.district && t.monopolyStatus === 'Monopoly'
            );

            // Check in other customers
            const existingInOtherCustomers = allCustomers.find(
                c => c.id !== customer.id && c.district === newTerritory.district && c.monopolyStatus === 'Monopoly'
            );

            if (existingInTerritories) {
                setWarning(`⚠️ This customer already has monopoly in ${newTerritory.district}!`);
            } else if (existingInOtherCustomers) {
                setWarning(`⚠️ ${existingInOtherCustomers.firmName} already has monopoly in ${newTerritory.district}!`);
            } else {
                setWarning('');
            }
        } else {
            setWarning('');
        }
    }, [newTerritory.monopolyStatus, newTerritory.district, territories, allCustomers, customer.id]);

    const loadTerritories = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTerritoriesForCustomer(customer.id);
            setTerritories(data);
        } catch (error) {
            console.error('Failed to load territories:', error);
            addToast('Failed to load territories', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTerritory = async () => {
        if (!newTerritory.state || !newTerritory.district) {
            addToast('Please select state and district', 'error');
            return;
        }

        if (warning && !window.confirm(`${warning}\n\nDo you still want to add this territory?`)) {
            return;
        }

        setIsAdding(true);
        try {
            await addTerritory(customer.id, newTerritory);
            addToast('Territory added successfully!', 'success');
            setNewTerritory({ state: '', district: '', monopolyStatus: 'Non-Monopoly' });
            await loadTerritories();
        } catch (error) {
            console.error('Failed to add territory:', error);
            addToast('Failed to add territory', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteTerritory = async (territoryId: string) => {
        if (!window.confirm('Are you sure you want to remove this territory?')) {
            return;
        }

        try {
            await deleteTerritory(territoryId);
            addToast('Territory removed successfully!', 'success');
            await loadTerritories();
        } catch (error) {
            console.error('Failed to delete territory:', error);
            addToast('Failed to remove territory', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        <i className="fas fa-map-marked-alt mr-3 text-blue-500"></i>
                        Manage Territories
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {/* Current Territories */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Current Territories ({territories.length})</h3>
                                {territories.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No territories added yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {territories.map((territory) => (
                                            <div key={territory.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {territory.district}, {territory.state}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${territory.monopolyStatus === 'Monopoly'
                                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                                            }`}>
                                                            {territory.monopolyStatus}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTerritory(territory.id!)}
                                                    className="ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                    title="Remove territory"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add New Territory */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Add New Territory</h3>

                                {warning && (
                                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                                        {warning}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">State</label>
                                        <select
                                            value={newTerritory.state}
                                            onChange={(e) => setNewTerritory({ ...newTerritory, state: e.target.value, district: '' })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(indianStatesAndDistricts).sort().map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">District</label>
                                        <select
                                            value={newTerritory.district}
                                            onChange={(e) => setNewTerritory({ ...newTerritory, district: e.target.value })}
                                            disabled={!newTerritory.state}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                                        <select
                                            value={newTerritory.monopolyStatus}
                                            onChange={(e) => setNewTerritory({ ...newTerritory, monopolyStatus: e.target.value as MonopolyStatus })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Non-Monopoly">Non-Monopoly</option>
                                            <option value="Monopoly">Monopoly</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddTerritory}
                                    disabled={isAdding || !newTerritory.state || !newTerritory.district}
                                    className="mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isAdding ? (
                                        <><Spinner size="sm" className="mr-2" /> Adding...</>
                                    ) : (
                                        <><i className="fas fa-plus mr-2"></i> Add Territory</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageTerritoriesModal;
