import UnifiedAuthLayout from '../components/layout/UnifiedAuthLayout'
import Register from '../components/Register'

export default function RegisterPage() {
  return (
    <UnifiedAuthLayout
      title="Créer un compte"
      subtitle="Rejoignez Vaultis Cloud et bénéficiez de services financiers nouvelle génération."
      type="register"
      mascotGreeting="Bienvenue chez Vaultis !"
    >
      <Register />
    </UnifiedAuthLayout>
  )
}