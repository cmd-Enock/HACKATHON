document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const signupForm = document.getElementById('signupForm');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const productsContainer = document.getElementById('productsContainer');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
            
            navLinks.classList.remove('active');
        });
    });
    
    const featureCards = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            userType: document.getElementById('userType').value,
            region: document.getElementById('region').value
        };
        
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            modal.style.display = 'block';
            signupForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    const products = [
        { id: 1, name: "Organic Tomatoes", price: 1.20, farm: "Green Valley Farms", category: "vegetables", location: "north" },
        { id: 2, name: "Premium Wheat", price: 0.80, farm: "Prairie Farms", category: "grains", location: "south" },
        { id: 3, name: "Organic Potatoes", price: 0.90, farm: "Highland Growers", category: "vegetables", location: "east" },
        { id: 4, name: "Fresh Apples", price: 1.50, farm: "Orchard Fresh", category: "fruits", location: "west" },
        { id: 5, name: "Golden Corn", price: 0.70, farm: "Sunshine Farms", category: "grains", location: "north" },
        { id: 6, name: "Sweet Berries", price: 2.50, farm: "Berry Best", category: "fruits", location: "south" }
    ];
    
    function renderProducts() {
        const category = categoryFilter.value;
        const location = locationFilter.value;
        
        const filteredProducts = products.filter(product => {
            return (category === 'all' || product.category === category) && 
                   (location === 'all' || product.location === location);
        });
        
        productsContainer.innerHTML = '';
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-img">${product.name}</div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>From ${product.farm}</p>
                    <p><strong>$${product.price.toFixed(2)}/kg</strong></p>
                    <button class="btn" data-id="${product.id}">Purchase</button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
        
        document.querySelectorAll('.product-card .btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const product = products.find(p => p.id == productId);
                alert(`Added ${product.name} to your cart!`);
            });
        });
    }
    
    categoryFilter.addEventListener('change', renderProducts);
    locationFilter.addEventListener('change', renderProducts);
    
    renderProducts();
    
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Average Crop Price ($/kg)',
                data: [1.20, 1.35, 1.15, 1.40, 1.25, 1.50],
                borderColor: '#4CAF50',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('incomeValue').textContent = `+${data.income_increase}%`;
            document.getElementById('wasteValue').textContent = `-${data.waste_reduction}%`;
            document.getElementById('yieldValue').textContent = `+${data.yield_improvement}%`;
        });
});