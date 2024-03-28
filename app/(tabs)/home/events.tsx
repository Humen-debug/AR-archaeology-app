import { AppBar, EventItem, LoadingPage, MainBody, NAVBAR_HEIGHT } from "@/components";
import { Event } from "@/models";
import { Paginated, useFeathers } from "@/providers/feathers_provider";
import { useAppTheme, AppTheme } from "@/providers/style_provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Calendar, CalendarUtils, DateData } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import { ActivityIndicator, Button, Text } from "react-native-paper";

export default function Page() {
  const feathers = useFeathers();
  const { theme } = useAppTheme();
  const style = useStyle({ theme });
  const [loaded, setLoaded] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

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

  useEffect(() => {
    async function init() {
      try {
        const res: Paginated<Event> = await feathers.service("events").find({ query: { $sort: "startDate,order" } });
        setEvents(res.data);
      } finally {
        setLoaded(true);
      }
    }
    init();
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
              Reset selected day
            </Text>
          </Button>
        </View>
        <Calendar
          enableSwipeMonths
          current={initDate}
          minDate={minDate}
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            calendarBackground: "transparent",
            textSectionTitleColor: theme.colors.text,
            monthTextColor: theme.colors.text,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.grey2,
          }}
        />
      </View>
      {!loaded ? (
        <LoadingPage />
      ) : (
        <FlatList
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: theme.spacing.lg,
            paddingBottom: NAVBAR_HEIGHT + theme.spacing.md,
            paddingHorizontal: theme.spacing.sm,
          }}
          data={events}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          renderItem={({ item }) => {
            return <EventItem {...item} />;
          }}
        />
      )}
    </MainBody>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignContent: "center" },
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
