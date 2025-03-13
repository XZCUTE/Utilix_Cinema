// This file re-exports LibraryPage to solve import compatibility issues
import LibraryPage from './LibraryPage';

// Export LibraryPage under the UserLibraryPage name
const UserLibraryPage = LibraryPage;

export default UserLibraryPage;
