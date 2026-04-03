import Header from '../Header';

function AuthLoadingScreen({ title = 'Verification...', description = 'Chargement de la session admin...' }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-panel">
          <div className="badge border-brand-200 bg-brand-50 text-brand-900">Admin</div>
          <h1 className="mt-4 text-3xl text-slate-950">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
            <span className="text-sm text-slate-500">Please wait...</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLoadingScreen;
