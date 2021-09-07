import {Storage, StorageService} from '@core/storage';
import React, {createContext, FC, useContext, useEffect, useMemo, useState} from 'react';
import {container} from 'tsyringe';
import {FrontendService} from '../frontend.service';

interface StorageContext {
    storage: Storage;
    service: FrontendService;
}

const StorageContext = createContext<StorageContext | undefined>(undefined);

export function useStorage(): Storage {
    const context = useContext(StorageContext);

    return context?.storage as Storage;
}

export function useFrontendService(): FrontendService {
    const context = useContext(StorageContext);

    return context?.service as FrontendService;
}

interface StorageProviderProps {
    storageService: StorageService;
}

export const StorageProvider: FC<StorageProviderProps> = ({storageService, children}) => {
    const [storageState, setStorage] = useState<Storage>();
    const service = useMemo(() => container.resolve(FrontendService), []);

    useEffect(() => {
        const subscription = storageService.onKeysChanged().subscribe((storage) => {
            setStorage(() => storage);
        });

        storageService.getStorage$().subscribe(setStorage);

        return () => subscription.unsubscribe();
    }, []);

    return (
        <StorageContext.Provider value={{storage: storageState as Storage, service}}>
            {storageState && children}
        </StorageContext.Provider>
    );
};
