// FAQ toggle functionality
function toggleFaq(element) {
    const item = element.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
        const faqAnswer = faq.querySelector('.faq-answer');
        if (faqAnswer) {
            faqAnswer.style.maxHeight = '0';
        }
    });
    
    // Toggle current FAQ
    if (!isActive) {
        item.classList.add('active');
        // Set maxHeight to scrollHeight to allow smooth transition
        answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
        // If clicking the same item, close it
        answer.style.maxHeight = '0';
    }
}
