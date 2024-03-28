import { AppBar, Carousel, MainBody, NAVBAR_HEIGHT, Icons, NumInput, ErrorPage, LoadingPage } from "@/components";
import { CalendarIcon, CalendarOutlinedIcon, LocationIcon, ProfileIcon } from "@/components/icons";
import { Event } from "@/models";
import { useAuth } from "@/providers/auth_provider";
import { useFeathers } from "@/providers/feathers_provider";
import { AppTheme, useAppTheme } from "@/providers/style_provider";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text, Title } from "react-native-paper";

export default function Page() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const feathers = useFeathers();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const style = useStyle({ theme });

  const [event, setEvent] = useState<Event>();
  const [venueName, setVenueName] = useState<string>();
  const [loaded, setLoaded] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]);

  const authenticated: boolean = !!(user && user._id);

  useEffect(() => {
    async function init() {
      try {
        if (!id) return;
        const res = await feathers.service("events").get(id, { query: { $populate: ["venue"] } });
        setEvent(res);
        //   fetch venue name if $populate not working
        if (typeof res.venue === "string") {
          const venue = await feathers.service("attractions").get(res.venue, { query: { $select: ["name"] } });
          setVenueName(venue.name);
        } else {
          setVenueName(res.venue?.name);
        }
      } catch (error) {
        console.warn(error);
      } finally {
        setLoaded(true);
      }
    }
    init();
  }, []);

  function renderTableRow({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
    return (
      <View style={style.tableRow}>
        <View style={style.tableHeader}>
          {icon && icon}
          <Text variant="bodyMedium" style={{ color: theme.colors.textOnPrimary, textAlignVertical: "center" }}>
            {title}
          </Text>
        </View>
        <View style={style.tableCell}>
          <Text variant="labelMedium" style={{ color: theme.colors.secondary, textAlignVertical: "center" }}>
            {value}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar showBack />
      {!loaded ? (
        <LoadingPage />
      ) : event ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: NAVBAR_HEIGHT + theme.spacing.md }}>
          {event.images && <Carousel images={event.images} />}
          <View style={style.topSection}>
            <Text variant="headlineSmall" style={{ color: theme.colors.text }}>
              {event.name}
            </Text>
            {event.content ? (
              <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                {event.content}
              </Text>
            ) : (
              event.briefDesc && (
                <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                  {event.briefDesc}
                </Text>
              )
            )}
          </View>

          {/* Table */}
          <View style={[style.table, { marginBottom: theme.spacing.xl }]}>
            {renderTableRow({
              title: "Start Date",
              value: moment(event.startDate).format("DD MMM,YYYY"),
              icon: <CalendarOutlinedIcon fill={theme.colors.textOnPrimary} />,
            })}
            {event.endDate &&
              renderTableRow({
                title: "End Date",
                value: moment(event.endDate).format("DD MMM, YYYY"),
                icon: <CalendarIcon fill={theme.colors.textOnPrimary} />,
              })}
            {venueName && renderTableRow({ title: "Venue", value: venueName, icon: <LocationIcon fill={theme.colors.textOnPrimary} /> })}
          </View>
          {/* Reservation */}
          {authenticated && (
            <View style={{ marginBottom: theme.spacing.xl }}>
              <Text variant="titleMedium" style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xs }}>
                Reservation
              </Text>

              <View style={[style.row, style.personSection]}>
                <ProfileIcon fill={theme.colors.text} size={24} />
                <View style={{ flexDirection: "column", gap: theme.spacing.xs, flex: 1 }}>
                  <View style={style.personRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                      Adults
                    </Text>
                    <NumInput inputValue={adults} onChange={setAdults} min={0} />
                  </View>
                  <View style={style.personRow}>
                    <View style={{ flexDirection: "column" }}>
                      <Text variant="labelMedium" style={{ color: theme.colors.text }}>
                        Children
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.grey2 }}>
                        Ages 0 to 17
                      </Text>
                    </View>
                    <NumInput inputValue={children} onChange={setChildren} min={0} />
                  </View>
                </View>
              </View>

              {/* Date & Time */}
              <View style={[style.row, style.dateTimeSection]}>
                <CalendarOutlinedIcon fill={theme.colors.text} size={24} />
                <Text variant="labelMedium" style={{ color: theme.colors.text, flex: 1 }}>
                  Date & Time
                </Text>
                <Button>{selectedDates && selectedDates.length ? moment(selectedDates[0]).format("DD MMM, YYYY") : "Select a day"}</Button>
              </View>
            </View>
          )}
          {/* Footer */}
          <View style={style.footer}>
            <Button mode="contained" style={{ borderRadius: theme.borderRadius.xs }} textColor={theme.colors.textOnPrimary}>
              {authenticated ? "Book now" : "Sign up to book now"}
            </Button>
          </View>
        </ScrollView>
      ) : (
        <ErrorPage />
      )}
    </MainBody>
  );
}
const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignContent: "center" },
    topSection: {
      flexDirection: "column",
      paddingHorizontal: theme.spacing.lg,
      rowGap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    table: {
      flexDirection: "column",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      rowGap: 2,
    },
    tableRow: {
      flexDirection: "row",
      columnGap: 2,
      borderRadius: theme.borderRadius.xs,
      overflow: "hidden",
    },
    tableHeader: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textOnPrimary,
      width: 120,
      flexDirection: "row",
      columnGap: theme.spacing.xs,
      flexWrap: "wrap",
      alignContent: "center",
      paddingVertical: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
    },
    tableCell: {
      flex: 1,
      backgroundColor: theme.colors.textOnPrimary,
      color: theme.colors.secondary,
      paddingVertical: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
      flexDirection: "row",
      alignContent: "center",
      minHeight: 32,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    personSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      columnGap: theme.spacing.sm,
    },
    personRow: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    dateTimeSection: {
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.xxs,
      columnGap: theme.spacing.sm,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
  });
