document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('avatar-upload');
    const triggerBtn = document.getElementById('upload-trigger');
    const form = document.getElementById('avatar-form');
  
    if (!fileInput || !triggerBtn || !form) return;
  
    triggerBtn.addEventListener('click', () => {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        form.submit();
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  });
  