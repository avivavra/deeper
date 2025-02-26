import { useState } from "react";
import { ChangeLogEntry } from "../../models";

export const useChangeLog = () => {
    const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
    
    const getChangeLogEntry = (name: string) => {
        return changeLog.find((entry) => entry.name === name);
    };

    const emptyChangeLog = () => {
        setChangeLog([]);
    };

    const removeChangeLogEntry = (name: string) => {
        setChangeLog(changeLog.filter((entry) => entry.name !== name));
    };

    const updateChangeLogEntry = (name: string, entry: ChangeLogEntry) => {
        setChangeLog(prev => ([
            ...prev.filter(entry => entry.name !== name),
            entry
        ]))
    };

    const addChangeLogEntry = (entry: ChangeLogEntry) => {
        setChangeLog(prev => [...prev, entry]);
    };

    return {
        changeLog,
        getChangeLogEntry,
        emptyChangeLog,
        removeChangeLogEntry,
        updateChangeLogEntry,
        addChangeLogEntry
    };
};