import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View>
      <Text>Home</Text>
      <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
}
