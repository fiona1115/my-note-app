"use client"

import { ReactTyped } from "react-typed";
import styles from './Welcome.module.css';
import { faGithub, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default function Welcome() {

    const typedStrings = [
        "個人網站",
        "企業官網",
        "應用程式",
        "抽獎系統",
        "AI聊天室",
    ];

    return (
        <header className={styles.header}>
            <main className={styles.headerOuterContainer}>
                <div className={styles.headerInnerContainer}>
                    <div className="min-h-screen flex items-center justify-center flex-col text-center">
                        <h1 className="text-neutral-900 text-lg md:text-3xl lg:text-4xl font-black mb-3 md:mb-5 lg:mb-8">
                            恭喜你，成功啟動了開發伺服器 🎉
                        </h1>
                        <h2 className="text-neutral-900 text-base md:text-xl lg:text-2xl font-bold mb-3 md:mb-5 lg:mb-8">
                            <span className="mb-2 block">這是一個
                                <a className="mx-2 hover:underline" href="https://react.dev/learn/start-a-new-react-project#nextjs-pages-router" target="_blank" rel="noopener noreferrer">
                                    React+Next
                                </a>
                                框架建構的網站</span>
                            <span className="">你可以用來製作</span>
                            <ReactTyped
                                strings={typedStrings}
                                typeSpeed={80}
                                backSpeed={80}
                                loop
                            />
                        </h2>
                        <div>
                            <a className="text-white bg-neutral-900 px-4 py-3 text-md rounded-md inline-block hover:bg-neutral-700 transition-colors" href="https://github.com/andy19910102/react-next-boilerplate" target="_blank">
                                <FontAwesomeIcon icon={faGithub} />
                                <span className="ml-2">專案原始碼</span>
                            </a>
                            <a className="text-white bg-red-600 px-4 py-3 text-md rounded-md inline-block hover:bg-red-500 transition-colors ml-3" href="https://youtu.be/79kAaDDls7k" target="_blank">
                                <FontAwesomeIcon icon={faYoutube} />
                                <span className="ml-2">如何從0到1創建</span>
                            </a>
                        </div>

                    </div>
                </div>
            </main>
        </header>
    )
}