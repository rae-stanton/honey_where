import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post("http://127.0.0.1:5000/logout", {
                access_token: localStorage.getItem('access_token'),
            });
            localStorage.removeItem('access_token');
            navigate('/');  // Redirect to home
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
}
