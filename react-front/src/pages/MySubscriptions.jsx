import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Table,
  Badge,
  Loader,
  Text,
  Button,
  Modal,
  Stack,
  Group,
  Alert,
  Card,
  SimpleGrid,
  ScrollArea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import api from "../api/api";
import Slider from "../components/Slider";

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_cost: 0, subscriptions_count: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedSubscriptionForTransactions, setSelectedSubscriptionForTransactions] = useState(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subscriptions");
      setSubscriptions(res.data.data || []);
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam pretplate.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCost = async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get("/my-subscriptions/total-cost");
      // Pretpostavka: response sadrži total_cost i subscriptions (niz)
      setSummary({
        total_cost: res.data.total_cost || 0,
        subscriptions_count: res.data.subscriptions?.length || 0,
      });
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam ukupnu cenu pretplata.",
        color: "red",
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchTotalCost();
  }, []);

  const openDetails = async (subscriptionId) => {
    try {
      const res = await api.get(`/subscriptions/${subscriptionId}`);
      setSelectedSubscription(res.data.data);
      setDetailsModalOpen(true);
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam detalje pretplate.",
        color: "red",
      });
    }
  };

  const cancelSubscription = async (subscription) => {
    const creatorId = subscription.creator?.id;
    if (!creatorId) {
      notifications.show({
        title: "Greška",
        message: "Nedostaje ID kreatora.",
        color: "red",
      });
      return;
    }

    setCancellingId(subscription.id);
    try {
      await api.delete(`/creators/${creatorId}/subscribe`);
      notifications.show({
        title: "Uspeh",
        message: "Pretplata je otkazana.",
        color: "green",
      });
      // Osveži obe liste
      await Promise.all([fetchSubscriptions(), fetchTotalCost()]);
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Otkazivanje nije uspelo.",
        color: "red",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const openTransactions = async (subscription) => {
    setSelectedSubscriptionForTransactions(subscription);
    setTransactionsModalOpen(true);
    setTransactionsLoading(true);
    try {
      const res = await api.get("/transactions");
      // Filtriranje transakcija koje pripadaju ovoj pretplati
      const allTransactions = res.data.transakcije || [];
      const filtered = allTransactions.filter(t => t.subscription?.id === subscription.id);
      setTransactions(filtered);
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam transakcije.",
        color: "red",
      });
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">
            Moje pretplate
          </Title>

          {subscriptions.length === 0 ? (
            <Alert color="blue" title="Info">
              Nemate aktivnih pretplata.
            </Alert>
          ) : (
            <>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Kreator</Table.Th>
                    <Table.Th>Nivo</Table.Th>
                    <Table.Th>Cena</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Akcije</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {subscriptions.map((sub) => (
                    <Table.Tr key={sub.id}>
                      <Table.Td>{sub.creator?.naziv_stranice || "-"}</Table.Td>
                      <Table.Td>{sub.tier?.naziv || "Bez nivoa"}</Table.Td>
                      <Table.Td>{sub.tier?.cena_mesecno || 0} €</Table.Td>
                      <Table.Td>
                        <Badge color={sub.status === "aktivna" ? "green" : "red"}>
                          {sub.status === "aktivna" ? "Aktivna" : "Otkazana"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            variant="light"
                            size="xs"
                            onClick={() => openDetails(sub.id)}
                          >
                            Detalji
                          </Button>
                          <Button
                            variant="light"
                            size="xs"
                            onClick={() => openTransactions(sub)}
                          >
                            Transakcije
                          </Button>
                          {sub.status === "aktivna" && (
                            <Button
                              variant="light"
                              color="red"
                              size="xs"
                              loading={cancellingId === sub.id}
                              onClick={() => cancelSubscription(sub)}
                            >
                              Otkaži
                            </Button>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {/* Statistika ispod tabele */}
              <Card withBorder shadow="sm" radius="md" padding="lg" mt="xl">
                <Title order={3} mb="md">
                  Sažetak pretplata
                </Title>
                {summaryLoading ? (
                  <Loader size="sm" />
                ) : (
                  <SimpleGrid cols={2} spacing="lg">
                    <div>
                      <Text size="sm" c="dimmed">
                        Broj aktivnih pretplata
                      </Text>
                      <Text size="xl" fw={700}>
                        {summary.subscriptions_count}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Ukupni mesečni trošak
                      </Text>
                      <Text size="xl" fw={700} c="blue">
                        {summary.total_cost.toFixed(2)} €
                      </Text>
                    </div>
                  </SimpleGrid>
                )}
              </Card>
            </>
          )}
        </Container>
      </div>

      {/* Modal za detalje pretplate */}
      <Modal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Detalji pretplate"
        centered
        size="md"
      >
        {selectedSubscription && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={700}>Kreator:</Text>
              <Text>{selectedSubscription.creator?.naziv_stranice}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={700}>Nivo:</Text>
              <Text>{selectedSubscription.tier?.naziv || "Bez nivoa"}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={700}>Cena mesečno:</Text>
              <Text>{selectedSubscription.tier?.cena_mesecno || 0} €</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={700}>Status:</Text>
              <Badge color={selectedSubscription.status === "aktivna" ? "green" : "red"}>
                {selectedSubscription.status === "aktivna" ? "Aktivna" : "Otkazana"}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text fw={700}>Datum početka:</Text>
              <Text>{new Date(selectedSubscription.datum_pocetka).toLocaleDateString()}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={700}>ID pretplate:</Text>
              <Text>{selectedSubscription.id}</Text>
            </Group>
          </Stack>
        )}
      </Modal>
      
      {/* Modal za transakcije */}
      <Modal
        opened={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
        title={`Transakcije za pretplatu: ${selectedSubscriptionForTransactions?.creator?.naziv_stranice || ""}`}
        centered
        size="lg"
      >
        {transactionsLoading ? (
          <Loader />
        ) : transactions.length === 0 ? (
          <Text c="dimmed">Nema transakcija za ovu pretplatu.</Text>
        ) : (
          <ScrollArea h={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Datum</Table.Th>
                  <Table.Th>Iznos</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transactions.map((tx) => (
                  <Table.Tr key={tx.id}>
                    <Table.Td>{new Date(tx.date).toLocaleDateString()}</Table.Td>
                    <Table.Td>{tx.amount} €</Table.Td>
                    <Table.Td>
                      <Badge color={tx.status === "uspešna" ? "green" : "red"}>
                        {tx.status === "uspešna" ? "Uspešna" : "Neuspešna"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Modal>
    </div>
  );
}