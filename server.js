const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Конфигурация Telegram
const BOT_TOKEN = "8425894974:AAH7CQ85x5jfKPtFOIfI3N3BK5ZzSTjnrrA";
const CHAT_ID = -1003059012422;
const MESSAGE_THREAD_ID = 2116;

const BOOKINGS_FILE = './bookings.json';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Для обслуживания статических файлов

// Функция для отправки в Telegram
async function sendToTelegram(text) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                message_thread_id: MESSAGE_THREAD_ID, 
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        if (!data.ok) {
            console.error('Telegram API error:', data);
        }
        return data;
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
}

// Убедимся, что файл bookings.json существует
function ensureBookingsFile() {
    if (!fs.existsSync(BOOKINGS_FILE)) {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
    }
}

// Единственный endpoint для бронирований
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = req.body;
        
        // Валидация обязательных полей
        if (!booking.name || !booking.phone) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Имя и телефон обязательны для заполнения' 
            });
        }

        // Добавляем дату создания
        booking.createdAt = new Date().toLocaleString('ru-RU');
        booking.id = Date.now(); // Простой ID

        // Сохраняем в файл
        ensureBookingsFile();
        let bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
        bookings.push(booking);
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

        console.log("✅ Получена новая заявка:", booking);

        // Отправляем в Telegram
        const telegramMessage = `
<b>🎯 НОВАЯ ЗАЯВКА НА КВЕСТ!</b>

👤 <b>Имя:</b> ${booking.name}
🔢 <b>Возраст:</b> ${booking.age || 'Не указан'}
📞 <b>Телефон:</b> ${booking.phone}
💬 <b>Комментарий:</b> ${booking.comment || 'Нет комментария'}
⏰ <b>Дата заявки:</b> ${booking.createdAt}
        `.trim();

        await sendToTelegram(telegramMessage);

        res.json({ 
            status: 'ok', 
            message: 'Заявка успешно отправлена!',
            id: booking.id 
        });

    } catch (error) {
        console.error('❌ Ошибка при обработке заявки:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Внутренняя ошибка сервера' 
        });
    }
});

// Получение всех заявок (для админки)
app.get('/api/bookings', (req, res) => {
    try {
        ensureBookingsFile();
        const bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
        res.json(bookings);
    } catch (error) {
        console.error('Error reading bookings:', error);
        res.status(500).json({ status: 'error', message: 'Ошибка чтения данных' });
    }
});

// Обслуживание фронтенда
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📧 Telegram бот настроен для чата: ${CHAT_ID}`);
    ensureBookingsFile();
    console.log(`💾 Файл бронирований: ${BOOKINGS_FILE}`);
});