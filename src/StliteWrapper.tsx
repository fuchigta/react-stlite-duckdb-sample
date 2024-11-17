// StliteWrapper.tsx
import React, { useEffect, useRef, useState } from 'react';
import './StliteWrapper.css';

interface StliteWrapperProps {
    pythonScript: string;
    requirements?: string[];
    className?: string;
    containerStyle?: React.CSSProperties;
    hideHeader?: boolean;
    height?: string | number;
}

interface StliteInstance {
    writeFile: (path: string, content: string) => Promise<void>;
    install: (packages: string[]) => Promise<void>;
    unmount: () => void;
}

const StliteWrapper: React.FC<StliteWrapperProps> = ({
    pythonScript,
    requirements = [],
    className = '',
    containerStyle = {},
    hideHeader = false,
    height = '500px'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stliteInstanceRef = useRef<StliteInstance | null>(null);
    const prevRequirementsRef = useRef<string[]>(requirements);

    useEffect(() => {
        const initializeStlite = async () => {
            try {
                if (containerRef.current && window.stlite) {
                    // 初回マウント時のみ実行
                    if (!stliteInstanceRef.current) {
                        const instance = await window.stlite.mount({
                            requirements: requirements,
                            entrypoint: 'streamlit_app.py',
                            files: {
                                'streamlit_app.py': pythonScript
                            },
                            disableProgressToasts: true
                        }, containerRef.current);

                        stliteInstanceRef.current = instance;

                        if (hideHeader) {
                            const header = containerRef.current.querySelector('header[data-testid="stHeader"]');
                            if (header) {
                                (header as HTMLElement).style.display = 'none';
                            }
                        }
                    } else {
                        // スクリプトの更新
                        await stliteInstanceRef.current.writeFile('streamlit_app.py', pythonScript);

                        // requirements の変更を検知して必要なパッケージをインストール
                        const newPackages = requirements.filter(
                            pkg => !prevRequirementsRef.current.includes(pkg)
                        );
                        if (newPackages.length > 0) {
                            await stliteInstanceRef.current.install(newPackages);
                        }
                        prevRequirementsRef.current = requirements;
                    }
                }
            } catch (error) {
                console.error('Failed to update stlite:', error);
            }
        };

        initializeStlite();

        // コンポーネントのアンマウント時のクリーンアップ
        return () => {
            if (stliteInstanceRef.current) {
                stliteInstanceRef.current.unmount();
                stliteInstanceRef.current = null;
            }
        };
    }, [pythonScript, requirements, hideHeader]);

    // ヘッダーの表示/非表示を制御
    useEffect(() => {
        if (containerRef.current) {
            const header = containerRef.current.querySelector('header[data-testid="stHeader"]');
            if (header) {
                (header as HTMLElement).style.display = hideHeader ? 'none' : 'block';
            }
        }
    }, [hideHeader]);

    return (
        <div
            className={`stlite-wrapper ${className}`.trim()}
            style={{
                ...containerStyle,
                position: 'relative',
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        >
            <div
                ref={containerRef}
                className="stlite-container"
            />
        </div>
    );
};

export default StliteWrapper;