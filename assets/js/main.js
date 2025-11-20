document.addEventListener('DOMContentLoaded', function() {
  // Пример простой анимации для матчей
  let matches = document.querySelectorAll('.match');
  matches.forEach(function(match) {
    match.addEventListener('mouseenter', () => match.style.background = "#e2ffe2");
    match.addEventListener('mouseleave', () => match.style.background = "");
  });
});
// In-memory storage (replaces localStorage due to sandbox restrictions)
let appData = {
    bookings: [],
    content: {
        title: 'ПОТОК',
        subtitle: 'Мастер-классы по паркуру',
        description: 'Мастер-класс по паркуру в пространстве «Паркур площадка парк останкино» помогут научиться искусству перемещения и преодоления препятствий. Игры в догонялки после обучения. Запись процесса на видео. Перед началом активностей будет разминка.',
        location: 'Паркур площадка парк Останкино',
        duration: '2 часа',
        ageLimit: 'от 12 лет'
    },
    images: {
        hero: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/7e5436ce-5bb1-4e23-989f-e3169e07166a.png',
        gallery1: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/bf08134e-d364-4e10-990a-3b50ff7f1fbf.png',
        gallery2: 'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/6327ae8c-26a3-4ebe-98b7-bf47b68d0f29.png'
    },
    isAuthenticated: false
};

// Admin credentials
const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'admin';

// Initialize app
function initApp() {
    // Восстановить заявки из localStorage
    const savedBookings = localStorage.getItem("bookings");
    appData.bookings = savedBookings ? JSON.parse(savedBookings) : [];
    loadContentToPage();
    updateBookingsCount();
}
// function initApp() {
//     loadContentToPage();
//     updateBookingsCount();
// }

// Load content to main page
function loadContentToPage() {
    document.getElementById('siteTitle').textContent = appData.content.title;
    document.getElementById('siteSubtitle').textContent = appData.content.subtitle;
    document.getElementById('siteDescription').textContent = appData.content.description;
    document.getElementById('locationText').textContent = appData.content.location;
    document.getElementById('durationText').textContent = appData.content.duration;
    document.getElementById('ageLimitText').textContent = appData.content.ageLimit;
    document.getElementById('heroImage').src = appData.images.hero;
    document.getElementById('galleryImage1').src = appData.images.gallery1;
    document.getElementById('galleryImage2').src = appData.images.gallery2;
}

// Modal functions
function openBookingForm() {
    document.getElementById('bookingModal').classList.add('active');
    document.getElementById('bookingForm').reset();
}

function closeBookingForm() {
    document.getElementById('bookingModal').classList.remove('active');
}

function showAdminLogin() {
    if (appData.isAuthenticated) {
        showAdminPage();
    } else {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.remove('show');
    }
}

function closeAdminLogin() {
    document.getElementById('loginModal').classList.remove('active');
}

// Submit booking form
function submitBooking(event) {
    event.preventDefault();
    const booking = {
        id: Date.now(),
        name: document.getElementById("userName").value,
        phone: document.getElementById("userPhone").value,
        age: document.getElementById("userAge").value,
        comment: document.getElementById("userComment").value,
        date: new Date().toLocaleString("ru-RU")
    };
    appData.bookings.push(booking);

    // Отправка на твой backend (замени URL, если другой порт/хост):
    fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
    })
    .then(res => res.json())
    .then(() => {
        showNotification("Заявка успешно отправлена!");
        closeBookingForm();
        updateBookingsCount();
    })
    .catch(() => {
        showNotification("Ошибка отправки! Проверь соединение.");
    });

    // Можно временно оставить
    // localStorage.setItem("bookings", JSON.stringify(appData.bookings));
}


// function submitBooking(event) {
//     event.preventDefault();
    
//     const booking = {
//         id: Date.now(),
//         name: document.getElementById('userName').value,
//         phone: document.getElementById('userPhone').value,
//         age: document.getElementById('userAge').value,
//         comment: document.getElementById('userComment').value,
//         date: new Date().toLocaleString('ru-RU')
//     };
    
//     appData.bookings.push(booking);
//     closeBookingForm();
//     showNotification('Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
//     updateBookingsCount();
// }

// Login handler
function handleLogin(event) {
    event.preventDefault();
    
    const login = document.getElementById('adminLogin').value;
    const password = document.getElementById('adminPassword').value;
    
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        appData.isAuthenticated = true;
        closeAdminLogin();
        showAdminPage();
    } else {
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = 'Неверный логин или пароль';
        errorEl.classList.add('show');
    }
}

// Show admin page
function showAdminPage() {
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('adminPage').classList.add('active');
    loadBookingsTable();
    loadContentForm();
    updateBookingsCount();
}

// Logout
function logout() {
    appData.isAuthenticated = false;
    document.getElementById('adminPage').classList.remove('active');
    document.getElementById('mainPage').classList.add('active');
    showNotification('Вы вышли из админ-панели');
}

// Tab switching
function showTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active to selected tab
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Load bookings table
function loadBookingsTable() {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (appData.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Заявок пока нет</td></tr>';
    } else {
        tbody.innerHTML = appData.bookings.map((booking, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${booking.name}</td>
                <td>${booking.phone}</td>
                <td>${booking.age}</td>
                <td>${booking.comment || '—'}</td>
                <td>${booking.date}</td>
            </tr>
        `).join('');
    }
}

// Load content form
function loadContentForm() {
    document.getElementById('editTitle').value = appData.content.title;
    document.getElementById('editSubtitle').value = appData.content.subtitle;
    document.getElementById('editDescription').value = appData.content.description;
    document.getElementById('editLocation').value = appData.content.location;
    document.getElementById('editDuration').value = appData.content.duration;
    document.getElementById('editAgeLimit').value = appData.content.ageLimit;
}

// Save content
function saveContent(event) {
    event.preventDefault();
    
    appData.content = {
        title: document.getElementById('editTitle').value,
        subtitle: document.getElementById('editSubtitle').value,
        description: document.getElementById('editDescription').value,
        location: document.getElementById('editLocation').value,
        duration: document.getElementById('editDuration').value,
        ageLimit: document.getElementById('editAgeLimit').value
    };
    
    loadContentToPage();
    showNotification('Контент успешно сохранен!');
}

// Handle image upload
function handleImageUpload(type, input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Update in-memory storage
        appData.images[type] = imageUrl;
        
        // Update previews
        if (type === 'hero') {
            document.getElementById('previewHeroImage').src = imageUrl;
            document.getElementById('heroImage').src = imageUrl;
        } else if (type === 'gallery1') {
            document.getElementById('previewGallery1').src = imageUrl;
            document.getElementById('galleryImage1').src = imageUrl;
        } else if (type === 'gallery2') {
            document.getElementById('previewGallery2').src = imageUrl;
            document.getElementById('galleryImage2').src = imageUrl;
        }
        
        showNotification('Изображение успешно загружено!');
    };
    reader.readAsDataURL(file);
}

// Update bookings count
function updateBookingsCount() {
    const count = appData.bookings.length;
    const badge = document.getElementById('bookingsCount');
    if (badge) {
        badge.textContent = count;
    }
}

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Close modals on outside click
window.onclick = function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const loginModal = document.getElementById('loginModal');
    
    if (event.target === bookingModal) {
        closeBookingForm();
    }
    if (event.target === loginModal) {
        closeAdminLogin();
    }
}
function exportBookingsToCSV() {
    // Заголовки
    const headers = ["ID", "Имя", "Телефон", "Возраст", "Комментарий", "Дата"];
    let csv = headers.join(",") + "\n";
    
    // Данные
    appData.bookings.forEach(b => {
        csv += [
            b.id,
            `"${b.name}"`,      // в кавычках — если вдруг запятые
            `"${b.phone}"`,
            b.age,
            `"${b.comment}"`,
            `"${b.date}"`
        ].join(",") + "\n";
    });

    // Создаём Blob и ссылку для скачивания
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bookings.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize app on load
window.onload = initApp;