import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';

const inputStyle = "block w-full px-3 py-2 rounded-md bg-card-bg-light dark:bg-card-bg-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark transition-colors shadow-sm focus:outline-none focus:border-primary-light dark:focus:border-primary-dark focus:ring-2 focus:ring-primary-light/30 dark:focus:ring-primary-dark/30";
const btnPrimary = "px-4 py-2 font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md transition-colors hover:bg-primary-hover-light dark:hover:bg-primary-hover-dark disabled:opacity-60 disabled:cursor-not-allowed";

export const CustomerTasks: React.FC<{ customerId: string }> = ({ customerId }) => {
    const { getTasksForCustomer, addTask, toggleTaskComplete } = useApp();
    const { addToast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            const tasksData = await getTasksForCustomer(customerId);
            setTasks(tasksData);
        } catch (e) {
            addToast('Could not fetch tasks.', 'error');
        }
    }, [customerId, getTasksForCustomer, addToast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAddTask = async () => {
        if (!newTaskText.trim() || !newDueDate) return;
        setIsSubmitting(true);
        try {
            await addTask({ customerId, task: newTaskText, dueDate: new Date(newDueDate).toISOString() });
            addToast('Task added!', 'success');
            setNewTaskText('');
            setNewDueDate('');
            await fetchTasks();
        } catch (e) {
            addToast('Failed to add task.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleToggleComplete = async (taskId: string) => {
        try {
            await toggleTaskComplete(taskId);
            await fetchTasks();
        } catch (e) {
            addToast('Failed to update task status.', 'error');
        }
    }

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="New task..." className={`${inputStyle} flex-grow`} />
                <input type="datetime-local" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className={inputStyle} />
                <button onClick={handleAddTask} disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? 'Adding...' : 'Add'}</button>
            </div>
            <ul className="space-y-2">
                {tasks.map(task => (
                    <li key={task.id} className="flex items-center p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                        <input type="checkbox" checked={task.completed} onChange={() => handleToggleComplete(task.id)} className="h-5 w-5 mr-3" />
                        <div className="flex-grow">
                            <p className={task.completed ? 'line-through text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]' : ''}>{task.task}</p>
                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Due: {new Date(task.dueDate).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
