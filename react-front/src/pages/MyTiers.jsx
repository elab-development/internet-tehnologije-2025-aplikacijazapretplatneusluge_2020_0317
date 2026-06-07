import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Table,
  Text,
  Loader,
  Alert,
  Badge,
  Card,
  Select,
  Group,
} from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import api from "../api/api";
import Slider from "../components/Slider";

export default function MyTiers() {
  const [tiers, setTiers] = useState([]);
  const [freeCount, setFreeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [loadingRates, setLoadingRates] = useState(false);

  // Dohvatanje zarada
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/my-tiers/earnings');
        setEarnings(res.data);
      } catch (err) {
        console.error(err);
        notifications.show({ title: "Greška", message: "Ne mogu da učitam zarade", color: "red" });
      }
    };
    fetchEarnings();
  }, []);

  // Dohvatanje kurseva
  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const res = await api.get('/currency-rates');
        setCurrencyRates(res.data);
      } catch (err) {
        console.error(err);
        notifications.show({ title: "Greška", message: "Ne mogu da učitam konverzije valuta", color: "red" });
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  // Funkcija za konverziju iznosa
  const convertAmount = (amountInEur) => {
    if (selectedCurrency === 'EUR' || !currencyRates?.rates) return amountInEur;
    const rate = currencyRates.rates[selectedCurrency];
    return rate ? amountInEur * rate : amountInEur;
  };

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await api.get("/my-tiers");
        setTiers(res.data.tiers || []);
        setFreeCount(res.data.free_subscribers_count || 0);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Ne mogu da učitam nivoe.");
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

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

  if (error) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Alert color="red" title="Greška">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  // Priprema podataka za tabelu – dodajemo i red za "Bez nivoa"
  const tableData = [
    ...tiers.map((tier) => ({
      key: `tier-${tier.id}`,
      naziv: tier.naziv,
      cena: tier.cena_mesecno,
      opis: tier.opis || "-",
      subscribers: tier.subscribers_count ?? 0,
      isFreeTier: false,
    })),
    {
      key: "free-tier",
      naziv: "Bez nivoa",
      cena: 0,
      opis: "Pretplatnici koji nisu izabrali nivo.",
      subscribers: freeCount,
      isFreeTier: true,
    },
  ];

  // Ukupan broj pretplatnika (za dodatnu informaciju)
  const totalSubscribers = tableData.reduce((sum, row) => sum + row.subscribers, 0);

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Group justify="space-between" align="center" mb="lg">
            <Title order={2}>Moji nivoi pretplate</Title>
            <Badge size="lg" variant="light" leftSection={<IconUsers size={14} />}>
              Ukupno pretplatnika: {totalSubscribers}
            </Badge>
          </Group>

          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nivo</Table.Th>
                <Table.Th>Cena (EUR)</Table.Th>
                <Table.Th>Opis</Table.Th>
                <Table.Th>Broj pretplatnika</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tableData.map((row) => (
                <Table.Tr key={row.key}>
                  <Table.Td>
                    <Text fw={row.isFreeTier ? 700 : 500}>{row.naziv}</Text>
                  </Table.Td>
                  <Table.Td>
                    {row.cena === 0 ? "Besplatno" : `${row.cena} EUR`}
                  </Table.Td>
                  <Table.Td>{row.opis}</Table.Td>
                  <Table.Td>
                    <Badge color={row.subscribers > 0 ? "green" : "gray"}>
                      {row.subscribers}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {tableData.length === 1 && freeCount === 0 && tiers.length === 0 && (
            <Alert color="blue" mt="md">
              Još uvek nemate nijedan nivo. Kliknite na "Dodaj nivo" u kreatorskom panelu.
            </Alert>
          )}

          {earnings && (
            <div style={{ marginTop: 32 }}>
              <Title order={3}>Zarada od pretplata</Title>
              <Table striped highlightOnHover mt="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nivo</Table.Th>
                    <Table.Th>Cena (EUR)</Table.Th>
                    <Table.Th>Broj pretplatnika</Table.Th>
                    <Table.Th>Ukupno (EUR)</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {earnings.tiers.map((tier) => (
                    <Table.Tr key={tier.id}>
                      <Table.Td>{tier.naziv}</Table.Td>
                      <Table.Td>{tier.cena_mesecno} €</Table.Td>
                      <Table.Td>{tier.subscribers_count}</Table.Td>
                      <Table.Td>{tier.total_earnings} €</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr fw={700}>
                    <Table.Td colSpan={3}>Ukupno:</Table.Td>
                    <Table.Td>{earnings.total_earnings} €</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>

              {/* Sekcija za konverziju */}
              {currencyRates && (
                <Card withBorder mt="lg" padding="md">
                  <Group justify="space-between" align="flex-end">
                    <div>
                      <Text fw={500}>Prikaži u drugoj valuti:</Text>
                      <Select
                        placeholder="Izaberite valutu"
                        data={['EUR', ...(currencyRates.target_currencies || [])].map(curr => ({ value: curr, label: curr }))}
                        value={selectedCurrency}
                        onChange={setSelectedCurrency}
                        style={{ width: 150 }}
                        mt="xs"
                      />
                    </div>
                    {selectedCurrency !== 'EUR' && !loadingRates && (
                      <div style={{ textAlign: 'right' }}>
                        <Text size="sm" c="dimmed">Kurs: 1 EUR = {currencyRates.rates?.[selectedCurrency]} {selectedCurrency}</Text>
                        <Title order={3}>
                          Ukupno: {convertAmount(earnings.total_earnings).toFixed(2)} {selectedCurrency}
                        </Title>
                      </div>
                    )}
                  </Group>
                </Card>
              )}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}