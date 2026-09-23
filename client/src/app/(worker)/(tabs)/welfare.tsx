import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '@/components/ui'
import { Colors, FontFamily } from '@/constants'

export default function WorkerWelfareScreen() {
  return (
    <Screen>
      <View style={s.center}>
        <Text style={s.title}>Welfare</Text>
      </View>
    </Screen>
  )
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FontFamily.headingBold, fontSize: 20, color: Colors.textPrimary },
})
