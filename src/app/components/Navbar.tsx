"use client"
import Link from 'next/link';
import { getToken } from '@/utils/jwt'; // Ensure you have a utility function to get the token
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  const token = getToken(); // Get the token from local storage

  return (
    <nav style={{ backgroundColor: '#333', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px' }}> {/* Set the background color of the navigation */}
      <ul style={{ display: 'flex', listStyleType: 'none', margin: '0', padding: '0' }}>
        <li style={{ marginRight: '20px' }}>
          <Link href="/create-okr" className={`nav-link ${pathname === '/create-okr' ? 'active' : ''}`} style={{ color: '#fff', textDecoration: 'none' }}>
            OKR
          </Link>
        </li>
        <li style={{ marginRight: '20px' }}>
          <Link href="/profile" className={`nav-link ${pathname === '/profile' ? 'active' : ''}`} style={{ color: '#fff', textDecoration: 'none' }}>
            Profile Management
          </Link>
        </li>
        {token && (
          <li style={{ marginRight: '20px' }}>
            <Link href="/reset-password" className={`nav-link ${pathname === '/reset-password' ? 'active' : ''}`} style={{ color: '#fff', textDecoration: 'none' }}>
              Password Recovery
            </Link>
          </li>
        )}
        <li>
          <Link href="/user-management" className={`nav-link ${pathname === '/user-management' ? 'active' : ''}`} style={{ color: '#fff', textDecoration: 'none' }}>
            User Management
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;