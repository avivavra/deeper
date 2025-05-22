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
    
    let elasticStorageDiff = 0;
    let s3StorageDiff = 0;
  
    changeLog.forEach(entry => {
      elasticStorageDiff += (entry.current.elasticStorage - entry.original.elasticStorage);
      s3StorageDiff += (entry.current.s3Storage - entry.original.s3Storage);
    });

    return {
        changeLog,
        getChangeLogEntry,
        emptyChangeLog,
        removeChangeLogEntry,
        updateChangeLogEntry,
        addChangeLogEntry,
        elasticStorageDiff,
        s3StorageDiff
    };
};