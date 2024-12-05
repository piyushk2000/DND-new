import { useState, useCallback } from 'react';
import { Board, Id } from '../types';

const useBoards = () => {
    const [columns, setColumns] = useState<{ [key: string]: Board[] | { [row: string]: Board[] } }>({
        Vendor: [
            { id: 101, title: 'Vendor 1' },
            { id: 102, title: 'Vendor 2' },
            { id: 103, title: 'Vendor 3' }
        ],
        Support: [
            { id: 201, title: 'HR' },
            { id: 202, title: 'Finance' },
            { id: 203, title: 'IT Support' }
        ],
        Core: [
            { id: 301, title: 'Operations' },
            { id: 302, title: 'Development' },
            { id: 303, title: 'Quality Assurance' }
        ],
        Client: [
            { id: 401, title: 'Client 1' },
            { id: 402, title: 'Client 2' },
            { id: 403, title: 'Client 3' }
        ],
        Staging: [{ id: 1, title: 'Staging A' }],
        Search: [{ id: 2, title: 'Search' }],
    });

    console.log("🚀 ~ useBoards ~ columns:", columns)

    const generateId = useCallback(() => {
        return Math.floor(Math.random() * 1000) + 1;
    }, []);

    const createNewBoard = useCallback(
        (column: string) => {
            const boardToAdd: Board = {
                id: generateId(),
                title: `Board ${Array.isArray(columns[column]) ? (columns[column] as Board[]).length + 1 : Object.values(columns[column] as { [row: string]: Board[] }).flat().length + 1}`
            };

            setColumns({
                ...columns,
                [column]: Array.isArray(columns[column])
                    ? [...(columns[column] as Board[]), boardToAdd]
                    : columns[column]
            });
            console.log(`Added new board to ${column}:`, boardToAdd);
        }
        ,
        [columns, generateId]
    );

    const deleteBoard = useCallback(
        (id: Id) => {
            const updatedColumns = { ...columns };
            for (const column in updatedColumns) {

                (updatedColumns[column] as Board[]) = (updatedColumns[column] as Board[]).filter(board => board.id !== id);

            }
            setColumns(updatedColumns);
        },
        [columns]
    );

    const updateBoard = useCallback(
        (id: Id, title: string) => {
            const updatedColumns = { ...columns };
            for (const column in updatedColumns) {

                (updatedColumns[column] as Board[]) = (updatedColumns[column] as Board[]).map(board => {
                    if (board.id !== id) return board;
                    return { ...board, title };
                });

            }
            setColumns(updatedColumns);
        },
        [columns]
    );

    const updateBoardsFromJson = useCallback((jsonData) => {
        const newColumns = {
            Vendor: [],
            Support: [],
            Core: [],
            Client: [],
            Uc1: [],
            Uc2: [],
            Staging: [{ id: 1, title: 'Staging A' }],
            Search: [{ id: 2, title: 'Search' }],
        };

        jsonData.forEach((item, index) => {
            const column = item.Support;
            const title = item.Finance;
            if (newColumns[column]) {
                newColumns[column].push({ id: generateId(), title });
            }
        });

        setColumns(newColumns);
        console.log("Updated columns from JSON data:", newColumns);
    }, [generateId]);

    return {
        columns,
        setColumns,
        createNewBoard,
        deleteBoard,
        updateBoard,
        updateBoardsFromJson, // Export the new function
    };
};

export default useBoards;