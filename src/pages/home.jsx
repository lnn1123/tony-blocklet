import { useEffect, useState } from 'react';

import './home.css';

function Home() {
  const [profile, setProfile] = useState({ username: '', email: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((response) => response.json())
      .then((data) => setProfile(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const saveProfile = () => {
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        }
        return response.json();
      })
      .then((data) => {
        setProfile(data);
        setIsEditing(false);
        setError('');
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="App">
      <div className="container">
        <h1>User Profile</h1>
        {error && <p className="error">{error}</p>}
        {isEditing ? (
          <div>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <button onClick={saveProfile}>Save</button>
          </div>
        ) : (
          <div>
            <p>Username: {profile.username}</p>
            <p>Email: {profile.email}</p>
            <p>Phone: {profile.phone}</p>
            <button
              onClick={() => {
                setForm(profile);
                setIsEditing(true);
              }}>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
