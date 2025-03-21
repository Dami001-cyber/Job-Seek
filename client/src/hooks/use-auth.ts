loginMutation: useMutation({
      mutationFn: (data) => apiRequest("/api/login", { method: "POST", body: data }),
      onSuccess: (data) => {
        setUser(data);
        // Redirect based on user role
        if (data.role === 'employer') {
          window.location.href = '/dashboard/employer';
        } else if (data.role === 'job_seeker') {
          window.location.href = '/dashboard/seeker';
        } else if (data.role === 'admin') {
          window.location.href = '/dashboard/admin';
        }
      },
    }),