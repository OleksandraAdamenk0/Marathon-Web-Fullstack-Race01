document.addEventListener('DOMContentLoaded', function () {
  const resetForm = document.getElementById('avatar-reset');

  if (resetForm) {
    resetForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      try {
        const res = await fetch('/api/images/avatar/reset', {
          method: 'PUT',
          credentials: 'include'
        });

        const data = await res.json();
        if (res.ok) {
            //alert(data.message || 'Avatar reset successfully');
            location.reload();
        }
        else {
            alert(data.error || 'Failed to reset avatar');
        }
      } catch (err) {
        alert('Request failed: ' + err.message);
      }
    });
  }
});