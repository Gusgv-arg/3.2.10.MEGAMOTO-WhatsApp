
// Detects numbers of at least 6 digits
function dniDetector(message) {
    const regex = /\b\d{6,}\b/; 
    return regex.test(message); 
}

export default dniDetector