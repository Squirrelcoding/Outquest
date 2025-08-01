// context/AuthContext.tsx
import { createContext, useEffect, useState, useContext } from 'react'
import { supabase } from '../lib/supabase' // adjust path
import { Session } from '@supabase/supabase-js'

const AuthContext = createContext<{
  session: Session | null
  loading: boolean
}>({ session: null, loading: true })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const getSession = async () => {
			const { data } = await supabase.auth.getSession()
			setSession(data.session)
			setLoading(false)
		}

		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})

		getSession()

		return () => {
			listener.subscription.unsubscribe()
		}
	}, [])

	return (
		<AuthContext.Provider value={{ session, loading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
