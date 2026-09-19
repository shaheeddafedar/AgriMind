import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ChatAssistant = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([
        {
            text: t('chat_greeting', 'Hello! How can I help you today?'),
            sender: 'bot'
        }
    ]);

    const [input, setInput] = useState('');
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const getBotResponse = (msg) => {
        const text = msg.toLowerCase();

        if (text.includes('soil ph')) {
            return 'Soil pH is a measure of soil acidity or alkalinity. Most crops prefer a pH between 6.0 and 7.5.';
        }

        if (text.includes('increase soil ph')) {
            return 'To increase soil pH (make it less acidic), you can add lime (calcium carbonate).';
        }

        if (text.includes('decrease soil ph')) {
            return 'To decrease soil pH (make it more acidic), you can add sulfur or aluminum sulfate.';
        }

        if (text.includes('wheat') && text.includes('fertilizer')) {
            return 'For wheat, NPK (Nitrogen, Phosphorus, Potassium) in a balanced ratio (e.g., 12:32:16) is usually recommended at sowing.';
        }

        if (text.includes('wheat')) {
            return 'Wheat is a Rabi crop, typically sown in winter (October-December) and harvested in spring (February-May).';
        }

        if (text.includes('rice')) {
            return 'Rice is a Kharif crop that requires high rainfall and high humidity. It is usually grown in the monsoon season.';
        }

        if (text.includes('kharif')) {
            return 'Kharif crops (monsoon crops) are grown from June to October. Examples include rice, maize, and cotton.';
        }

        if (text.includes('rabi')) {
            return 'Rabi crops (winter crops) are sown from October to December. Examples include wheat, barley, and mustard.';
        }

        if (text.includes('hello') || text.includes('hi')) {
            return 'Hello! Ask me about crops, seasons, or soil health.';
        }

        return "Sorry, I'm just a simple bot. Try asking about 'soil ph', 'wheat', or 'kharif season'.";
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const query = input.trim();

        setMessages(prev => [
            ...prev,
            {
                text: query,
                sender: 'user'
            }
        ]);

        setInput('');

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    text: getBotResponse(query),
                    sender: 'bot'
                }
            ]);
        }, 600);
    };

    return (
        <>
            <div className="sidebar-widget">
                <h3>
                    <i className="fas fa-comment-dots"></i>
                    {' '}{t('chat_assistant', 'Chat Assistant')}
                </h3>

                <div className="chatbot">
                    <div className="chat-window" ref={chatRef}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`chat-message ${message.sender}`}
                            >
                                {message.text}
                            </div>
                        ))}
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            id="chat-query"
                            placeholder={t('chat_placeholder', 'Ask about crops...')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSend();
                                }
                            }}
                        />

                        <button
                            type="button"
                            id="ask-btn"
                            onClick={handleSend}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="chatbot-tips">
                <p>
                    <strong>{t('try_asking', 'Try asking:')}</strong>
                </p>

                <ul>
                    <li onClick={() => setInput(t('chat_fertilizer_wheat', 'Fertilizer for wheat'))} style={{ cursor: 'pointer' }}>{t('chat_fertilizer_wheat', 'Fertilizer for wheat')}</li>
                    <li onClick={() => setInput(t('chat_rice_time', 'Best time to plant rice'))} style={{ cursor: 'pointer' }}>{t('chat_rice_time', 'Best time to plant rice')}</li>
                    <li onClick={() => setInput(t('chat_soil_ph', 'What is soil pH?'))} style={{ cursor: 'pointer' }}>{t('chat_soil_ph', 'What is soil pH?')}</li>
                    <li onClick={() => setInput(t('chat_kharif', 'What is kharif season'))} style={{ cursor: 'pointer' }}>{t('chat_kharif', 'What is kharif season')}</li>
                    <li onClick={() => setInput(t('chat_rabi', 'What is rabi season'))} style={{ cursor: 'pointer' }}>{t('chat_rabi', 'What is rabi season')}</li>
                    <li onClick={() => setInput(t('chat_increase_ph', 'How to increase soil ph'))} style={{ cursor: 'pointer' }}>{t('chat_increase_ph', 'How to increase soil ph')}</li>
                    <li onClick={() => setInput(t('chat_decrease_ph', 'How to decrease soil ph'))} style={{ cursor: 'pointer' }}>{t('chat_decrease_ph', 'How to decrease soil ph')}</li>
                </ul>
            </div>
        </>
    );
};

export default ChatAssistant;