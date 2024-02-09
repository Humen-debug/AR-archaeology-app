import { AppBar, EventItem, EventItemProps, MainBody, NAVBAR_HEIGHT } from "@/components";
import { useFeathers } from "@/providers/feathers_provider";
import { useAppTheme, AppTheme } from "@/providers/style_provider";
import { useCallback, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Calendar, CalendarUtils, DateData } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import { Button, Text } from "react-native-paper";

// demo, need to be deleted once implement event data
const DATA = [
  {
    name: "Pottery Making",
    briefDesc: "Get your hands dirty and try out these great pottery classes",
    startDate: new Date(),
  },
  {
    name: "Pottery Painting",
    briefDesc: "There is a lot of fun things to do, let’s paint your own pottery",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 1000 * 3600 * 24),
  },
  {
    name: "Pottery Festival",
    briefDesc: "There is a lot of fun things to do, let’s paint your own pottery",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 1000 * 3600 * 24),
  },
];

export default function Page() {
  const feathers = useFeathers();
  const { theme } = useAppTheme();
  const style = useStyle({ theme });

  const initDate = CalendarUtils.getCalendarDateString(new Date());
  const minDate = initDate;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const markedDates: MarkedDates = useMemo(() => {
    if (selectedDate)
      return {
        [selectedDate]: {
          selected: true,
          selectedColor: theme.colors.primary,
          selectedTextColor: theme.colors.textOnPrimary,
          customTextStyle: { textAlignVertical: "center" },
        },
      };
    else {
      return {};
    }
  }, [selectedDate]);

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);
  const clearDay = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar showBack title="What's Hot!" />
      <View style={style.calendarContainer}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Button
            buttonColor="transparent"
            mode="outlined"
            style={style.outlinedButton}
            labelStyle={{ marginVertical: theme.spacing.xs, marginHorizontal: theme.spacing.md }}
            onPress={clearDay}
          >
            <Text variant="labelSmall" style={style.buttonText}>
              Clear
            </Text>
          </Button>
        </View>
        <Calendar enableSwipeMonths current={initDate} minDate={minDate} onDayPress={onDayPress} markedDates={markedDates} />
      </View>
      <FlatList
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: theme.spacing.lg,
          paddingBottom: NAVBAR_HEIGHT + theme.spacing.md,
          paddingHorizontal: theme.spacing.sm,
        }}
        data={DATA}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        renderItem={({ item }) => {
          const props: EventItemProps = {
            name: item.name,
            briefDesc: item.briefDesc,
            startDate: item.startDate,
            endDate: item.endDate,
          };
          return <EventItem {...props} />;
        }}
      />
    </MainBody>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    calendarContainer: {
      flexDirection: "column",
      backgroundColor: theme.colors.container,
      borderBottomRightRadius: theme.borderRadius.md,
      borderBottomLeftRadius: theme.borderRadius.md,
      overflow: "hidden",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.lg,

      elevation: 4,
      shadowColor: theme.colors.shadowColor,
      shadowRadius: 4,
      shadowOpacity: 0.75,
      shadowOffset: { height: 12, width: 0 },
    },

    outlinedButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 999,
      maxHeight: 34,
    },
    buttonText: {
      color: theme.colors.primary,
      textAlignVertical: "center",
    },
  });
