import UnifiedAuthLayout from '../components/layout/UnifiedAuthLayout'
import Login from '../components/Login'

export default function LoginPage() {
  return (
    <UnifiedAuthLayout
      title="Connexion"
      subtitle="Accédez à votre console bancaire Vaultis et pilotez vos flux en temps réel."
      type="login"
      mascotGreeting="Ravi de vous revoir !"
    >
      <Login />
    </UnifiedAuthLayout>
  )
}