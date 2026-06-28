import { useState, useEffect } from 'react';
import { Clock, Activity, HardDrive, Network, Globe } from 'lucide-react';

export function StatusBar() {
    const [time, setTime] = useState(new Date());
    const [sysInfo, setSysInfo] = useState({
        cpu: 'Yükleniyor...',
        ram: 'Yükleniyor...',
        local_ip: '...',
        external_ip: '...',
    });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const response = await fetch('/api/system-status');
                if (response.ok) {
                    const data = await response.json();
                    setSysInfo(data);
                }
            } catch (error) {
                console.error("Failed to fetch system info", error);
            }
        };

        fetchSystemInfo();
        // Saniyede bir yerine 5 saniyede bir çekmek CPU'yu yormaması için daha iyidir.
        const sysTimer = setInterval(fetchSystemInfo, 5000);
        
        return () => clearInterval(sysTimer);
    }, []);

    return (
        <div className="bg-neutral-900 text-neutral-300 h-8 flex items-center justify-between px-4 text-[11px] font-mono border-b border-black" suppressHydrationWarning={true}>
            <div className="flex items-center space-x-6">
                <div className="flex items-center text-green-400">
                    <Activity className="w-3 h-3 mr-1.5" />
                    CPU: {sysInfo.cpu}%
                </div>
                <div className="flex items-center text-blue-400">
                    <HardDrive className="w-3 h-3 mr-1.5" />
                    RAM: {sysInfo.ram}%
                </div>
                <div className="flex items-center text-orange-300">
                    <Network className="w-3 h-3 mr-1.5" />
                    İç Ağ IP: {sysInfo.local_ip}
                </div>
                <div className="flex items-center text-purple-300">
                    <Globe className="w-3 h-3 mr-1.5" />
                    Dış IP: {sysInfo.external_ip}
                </div>
            </div>
            
            <div className="flex items-center font-bold text-white tracking-wider" suppressHydrationWarning={true}>
                <Clock className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                {time.toLocaleDateString('tr-TR')} - {time.toLocaleTimeString('tr-TR')}
            </div>
        </div>
    );
}
