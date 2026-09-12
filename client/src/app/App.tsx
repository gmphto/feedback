import { useAuth } from '../features/auth/state/AuthProvider';
import { AppRoutes } from './AppRoutes';
import { productName } from './shell/layout';

function SignedOutPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-20">
      <h1>{productName}</h1>
      <p className="mt-3 text-slate-600">
        Turn a rough project idea into a clear MVP scope.
      </p>
    </main>
  );
}

export default function App() {
  const isAuthenticated = useAuth('App', (state) => state.isAuthenticated, true);

  return isAuthenticated ? <AppRoutes /> : <SignedOutPage />;
}
