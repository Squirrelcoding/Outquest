// import React, { useState } from 'react'
// import {
//   Alert,
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native'
// import { supabase } from '../supabase'

// export default function Auth() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)

//   async function signInWithEmail() {
//     setLoading(true)
//     const { error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) Alert.alert('Sign In Error', error.message)
//     setLoading(false)
//   }

//   async function signUpWithEmail() {
//     setLoading(true)
//     const {
//       data: { session },
//       error,
//     } = await supabase.auth.signUp({ email, password })
//     if (error) Alert.alert('Sign Up Error', error.message)
//     if (!session) Alert.alert('Check your inbox for email verification!')
//     setLoading(false)
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           placeholder="email@address.com"
//           autoCapitalize="none"
//           keyboardType="email-address"
//           value={email}
//           onChangeText={setEmail}
//           style={styles.input}
//         />
//       </View>

//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Password</Text>
//         <TextInput
//           placeholder="Password"
//           secureTextEntry
//           autoCapitalize="none"
//           value={password}
//           onChangeText={setPassword}
//           style={styles.input}
//         />
//       </View>

//       <TouchableOpacity
//         style={[styles.button, loading && styles.disabled]}
//         onPress={signInWithEmail}
//         disabled={loading}
//       >
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, loading && styles.disabled]}
//         onPress={signUpWithEmail}
//         disabled={loading}
//       >
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
//       </TouchableOpacity>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 40,
//     padding: 16,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     marginBottom: 6,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 10,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#3b82f6',
//     padding: 12,
//     borderRadius: 6,
//     marginVertical: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   disabled: {
//     opacity: 0.6,
//   },
// })


import React from 'react';
import { View, Text, Button } from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  return (
	<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
	  <Text>Profile Screen</Text>
	  <Button title="Go Back" onPress={() => navigation.goBack()} />
	</View>
  );
}
