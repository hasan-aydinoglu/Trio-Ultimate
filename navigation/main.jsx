import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import BottomNavigation from './bottom-navigation';
import Game from '../screens/game';

const Stack = createNativeStackNavigator();

function Main() {
    return (
        <NavigationContainer >
            <Stack.Navigator headerMode={false}>
                {/* Buradaki 'Home' ismini değiştirelim */}
                <Stack.Screen name="HomeStack" options={{ headerShown: false, headerBackTitle: 'Back', title:'Back' }} component={BottomNavigation} />
                <Stack.Screen name="game" component={Game} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Main;
