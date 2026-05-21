// Joke Generator App
class JokeGenerator {
    constructor() {
        this.apiUrl = 'https://v2.jokeapi.dev/joke';
        this.currentJoke = null;
        this.jokeHistory = this.loadHistory();
        this.currentCategory = 'any';
        this.currentType = 'single';

        this.initEventListeners();
        this.renderHistory();
    }

    initEventListeners() {
        // Main button
        document.getElementById('getJokeBtn').addEventListener('click', () => this.fetchJoke());

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => this.copyJoke());

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
            });
        });

        // Joke type radio buttons
        document.querySelectorAll('input[name="jokeType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentType = e.target.value;
            });
        });

        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());

        // Enter key support
        document.getElementById('timezoneInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchJoke();
        });

        // Fetch joke on page load
        this.fetchJoke();
    }

    async fetchJoke() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const jokeText = document.getElementById('jokeText');

        // Show loading state
        loadingSpinner.style.display = 'block';
        jokeText.textContent = 'Loading...';

        try {
            // Build URL based on selections
            let url = `${this.apiUrl}/${this.currentCategory}`;
            const params = [];

            if (this.currentType !== 'any') {
                params.push(`type=${this.currentType}`);
            }

            params.push('safe-mode'); // Family-friendly jokes

            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'Could not fetch joke');
            }

            // Process joke based on type
            let jokeContent = '';
            let jokeType = '';

            if (data.type === 'single') {
                jokeContent = data.joke;
                jokeType = 'Single Liner';
            } else if (data.type === 'twopart') {
                jokeContent = `${data.setup}\n\n${data.delivery}`;
                jokeType = 'Two Part';
            }

            // Update UI
            this.currentJoke = jokeContent;
            jokeText.innerHTML = jokeContent.replace(/\n/g, '<br>');
            document.getElementById('jokeType').textContent = `Type: ${jokeType} | Category: ${data.category}`;

            // Add to history
            this.addToHistory(jokeContent);

            loadingSpinner.style.display = 'none';

        } catch (error) {
            console.error('Error fetching joke:', error);
            jokeText.textContent = `Oops! ${error.message}. Try again!`;
            loadingSpinner.style.display = 'none';
        }
    }

    copyJoke() {
        if (!this.currentJoke) {
            alert('No joke to copy!');
            return;
        }

        navigator.clipboard.writeText(this.currentJoke).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;

            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy joke');
        });
    }

    addToHistory(joke) {
        // Limit to 10 most recent jokes
        const truncated = joke.length > 50 ? joke.substring(0, 50) + '...' : joke;
        
        this.jokeHistory.unshift(truncated);
        if (this.jokeHistory.length > 10) {
            this.jokeHistory.pop();
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');

        if (this.jokeHistory.length === 0) {
            historyList.innerHTML = '<li class="empty-message">No history yet</li>';
            return;
        }

        historyList.innerHTML = this.jokeHistory
            .map((joke, index) => `<li>${index + 1}. ${joke}</li>`)
            .join('');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the joke history?')) {
            this.jokeHistory = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    saveHistory() {
        localStorage.setItem('jokeHistory', JSON.stringify(this.jokeHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('jokeHistory');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new JokeGenerator();
});
