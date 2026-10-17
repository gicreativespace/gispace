document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const quickReplies = document.getElementById('quick-replies');

    // Chat State
    let state = 'ask_name'; // ask_name, ask_age, ask_gender, ask_address, ready
    let visitor = { name: '', age: 0, gender: '', address: '' };

    // Predefined Q&A Directory
    const qaDirectory = [
        { id: 'about', q: 'మా గురించి చెప్పండి', en: 'About Us', link: 'about.html' },
        { id: 'writings', q: 'GI.Writings గురించి చెప్పండి', en: 'About GI.Writings', link: 'gi_writings.html' },
        { id: 'devotional', q: 'GI.Devotional గురించి చెప్పండి', en: 'About GI.Devotional', link: 'gi_devotional.html' },
        { id: 'digital', q: 'GI.Digital సేవలు ఏమిటి?', en: 'GI.Digital Services', link: 'gi_digital.html' },
        { id: 'education', q: 'GI.Education గురించి చెప్పండి', en: 'About GI.Education', link: 'gi_education.html' },
        { id: 'space', q: 'GI.Space అంటే ఏమిటి?', en: 'What is GI.Space?', link: 'gi_space.html' },
        { id: 'contact', q: 'సంప్రదించడం ఎలా?', en: 'How to contact?', link: 'contact.html' }
    ];

    const allAddressTerms = [
        { te: 'అయ్యా', en: 'Sir' },
        { te: 'అమ్మా', en: 'Madam' },
        { te: 'అన్నయ్య', en: 'Elder Brother' },
        { te: 'అక్క', en: 'Elder Sister' },
        { te: 'బాబాయ్', en: 'Uncle' },
        { te: 'చెల్లి', en: 'Younger Sister' },
        { te: 'తమ్ముడు', en: 'Younger Brother' },
        { te: 'తాతయ్య', en: 'Grandfather' },
        { te: 'అమ్మమ్మ', en: 'Grandmother' }
    ];

    // Helper to add a message
    function addMessage(text, sender = 'bot', isHtml = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-bubble ${sender}`;
        if (isHtml) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.textContent = text;
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Helper to show quick replies
    function showQuickReplies(replies, callback) {
        quickReplies.innerHTML = '';
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            
            // Format text with language spans
            let teText = reply.te || reply.q;
            let enText = reply.en || '';
            btn.innerHTML = `<span class="lang-te">${teText}</span>`;
            if (enText) {
                btn.innerHTML += `<br><span class="lang-en">${enText}</span>`;
            }

            btn.onclick = () => {
                quickReplies.innerHTML = '';
                addMessage(teText, 'user');
                callback(reply);
            };
            quickReplies.appendChild(btn);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- CONVERSATION FLOW ---
    
    // 1. Initial Greeting
    setTimeout(() => {
        addMessage('నమస్కారం! నేను గోదారోడు. గోదావరి ఒడ్డు నుంచి మీకు స్వాగతం!');
        setTimeout(() => {
            addMessage('రండి, మీ పేరు చెప్పండి. <span class="lang-en">Please tell me your name.</span>', 'bot', true);
        }, 1000);
    }, 500);

    // 2. Handle User Input
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = chatInput.value.trim();
        if (!val) return;

        addMessage(val, 'user');
        chatInput.value = '';

        if (state === 'ask_name') {
            visitor.name = val;
            state = 'ask_age';
            setTimeout(() => {
                addMessage(`అలాగేనండి ${visitor.name} గారు. మీ వయస్సు ఎంత? <span class="lang-en">How old are you?</span>`, 'bot', true);
            }, 800);
        } 
        else if (state === 'ask_age') {
            const age = parseInt(val, 10);
            if (isNaN(age) || age < 1 || age > 120) {
                addMessage('దయచేసి సరైన వయస్సును సంఖ్యలలో చెప్పండి (ఉదా: 25). <span class="lang-en">Please enter a valid age in numbers.</span>', 'bot', true);
                return;
            }
            
            visitor.age = age;
            state = 'ask_gender';
            setTimeout(() => {
                addMessage(`ఆయ్ ${visitor.name}, మీరు పురుషులా, మహిళా? <span class="lang-en">Are you male or female?</span>`, 'bot', true);
                
                showQuickReplies([
                    { te: 'పురుషుడు', en: 'Male', value: 'male' },
                    { te: 'మహిళ', en: 'Female', value: 'female' }
                ], (reply) => {
                    visitor.gender = reply.value;
                    suggestAddress();
                });
            }, 800);
        }
        else if (state === 'ready') {
            // Fallback if they type instead of clicking a quick reply
            setTimeout(() => {
                addMessage('దయచేసి క్రింద ఇచ్చిన ఎంపికలలో ఒకటి ఎంచుకోండి.', 'bot');
                showMenu();
            }, 500);
        }
    });

    // 3. Address Calculation Logic
    function suggestAddress() {
        state = 'ask_address';
        let suggested = '';
        
        if (visitor.gender === 'male') {
            if (visitor.age > 55) suggested = 'తాతయ్య';
            else if (visitor.age >= 35) suggested = 'అన్నయ్య';
            else suggested = 'తమ్ముడు';
        } else {
            if (visitor.age > 55) suggested = 'అమ్మమ్మ';
            else if (visitor.age >= 45) suggested = 'అమ్మా';
            else if (visitor.age >= 35) suggested = 'అక్క';
            else suggested = 'చెల్లి';
        }

        setTimeout(() => {
            addMessage(`మీ వయస్సు ప్రకారం మిమ్మల్ని '<strong>${suggested}</strong>' అని పిలవచ్చా? <span class="lang-en">Based on your age, may I call you '${suggested}'?</span>`, 'bot', true);
            
            // Provide the suggested one first, then the rest of the options
            let options = [
                { te: `అవును, ${suggested} అని పిలవండి`, en: `Yes, call me ${suggested}`, chosen: suggested },
                { te: 'వేరే పిలుపు కావాలి', en: 'I prefer another term', chosen: 'other' }
            ];

            showQuickReplies(options, (reply) => {
                if (reply.chosen === 'other') {
                    addMessage('సరే, మీకు నచ్చిన పిలుపును ఎంచుకోండి. <span class="lang-en">Okay, please choose your preferred term.</span>', 'bot', true);
                    showQuickReplies(allAddressTerms, (termReply) => {
                        visitor.address = termReply.te;
                        startMenu();
                    });
                } else {
                    visitor.address = reply.chosen;
                    startMenu();
                }
            });
        }, 800);
    }

    // 4. Start Main Menu
    function startMenu() {
        state = 'ready';
        setTimeout(() => {
            addMessage(`చాలా సంతోషం ${visitor.name} ${visitor.address}. రండి, మీకు ఏ విషయంలో సహాయం కావాలి? <span class="lang-en">Very happy ${visitor.name}. Please tell me how I can help you.</span>`, 'bot', true);
            showMenu();
        }, 1000);
    }

    // 5. Show Main Menu
    function showMenu() {
        showQuickReplies(qaDirectory, (reply) => {
            setTimeout(() => {
                let answer = `ఖచ్చితంగా ${visitor.address}. ఇక్కడ క్లిక్ చేయండి: <br><br>`;
                answer += `<a href="${reply.link}" class="chat-link">మరింత సమాచారం కోసం ఇక్కడ క్లిక్ చేయండి →</a>`;
                addMessage(answer, 'bot', true);
                
                // Allow them to ask another question
                setTimeout(() => {
                    addMessage('మరేదైనా సహాయం కావాలా? <span class="lang-en">Do you need any other help?</span>', 'bot', true);
                    showMenu();
                }, 1500);
            }, 800);
        });
    }
});
