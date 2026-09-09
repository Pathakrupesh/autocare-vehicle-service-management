/**
 * AutoCare Admin Analytics & Charts Module
 */
document.addEventListener('DOMContentLoaded', () => {
    initRevenueChart();
    initServiceTypeChart();
});

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [{
                label: 'Revenue (NPR)',
                data: [120000, 150000, 180000, 140000, 210000, 240000],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

function initServiceTypeChart() {
    const ctx = document.getElementById('serviceTypeChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['General Service', 'Oil Change', 'Brake Systems', 'Electrical', 'Tires'],
            datasets: [{
                data: [40, 25, 15, 12, 8],
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#64748b']
            }]
        },
        options: {
            responsive: true
        }
    });
}