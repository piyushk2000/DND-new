import { useState, useCallback } from 'react';
import { Task, Id } from '../types';

const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const generateId = useCallback(() => {
        return Math.floor(Math.random() * 1000) + 1;
    }, []);

    const createTask = useCallback(
        (boardId: Id, content?: string, index?: number) => {
            const newTask: Task = {
                id: generateId(),
                boardId,
                content: content || `Task ${tasks.length + 1}`,
            };
            const newTasks = [...tasks];
            if (typeof index === 'number') {
                newTasks.splice(index, 0, newTask);
            } else {
                newTasks.push(newTask);
            }
            setTasks(newTasks);
        },
        [tasks, generateId]
    );

    const deleteTask = useCallback(
        (id: Id) => {
            const newTasks = tasks.filter((task) => task.id !== id);
            setTasks(newTasks)
        },
        [tasks]
    );

    const updateTask = useCallback(
        (id: Id, content: string) => {
            const newTasks = tasks.map((task) => {
                if (task.id !== id) return task;
                return { ...task, content }
            })
            setTasks(newTasks)
        },
        [tasks]
    );

    const createBulkTasks = useCallback(
        (boardId: Id, contents: string[]) => {
            const newTasks = contents.map((content) => ({
                id: generateId(),
                boardId,
                content,
            }));
            setTasks((prevTasks) => [...prevTasks, ...newTasks]);
        },
        [generateId]
    );

    const moveTaskToStaging = useCallback(
        (id: Id) => {
            setTasks((prevTasks) => {
                return prevTasks.map((task) => {
                    if (task.id === id) {
                        return { ...task, boardId: 1 }; // Assuming 1 is the ID for the staging area
                    }
                    return task;
                });
            });
        },
        []
    );

    return {
        tasks,
        setTasks,
        createTask,
        deleteTask,
        updateTask,
        createBulkTasks,
        moveTaskToStaging, // Export the new function
    };
};

export default useTasks;