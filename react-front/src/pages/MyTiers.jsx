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
  Tabs,
} from "@mantine/core";
import { IconUsers, IconChartBar, IconTable } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/api";
import Slider from "../components/Slider";

export default function MyTiers() {
  const [tiers, setTiers] = useState([]);
  const [freeCount, setFreeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [currencyRates, setCurrencyRates] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [loadingRates, setLoadingRates] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  // Dohvatanje zarada po nivoima (postojeće)
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

  // Dohvatanje mesečne dinamike zarade (new!)
  useEffect(() => {
    const fetchMonthlyEarnings = async () => {
      try {
        const res = await api.get('/transactions/earnings');
        // Pretpostavka: response ima { monthly_breakdown: [{year, month, total}] }
        const monthly = res.data.monthly_breakdown || [];
        // Format za recharts: { month: "Jan 2024", total: 123.45 }
        const formatted = monthly.map(item => ({
          month: `${item.month}/${item.year}`, // ili "Jan 2024"
          total: parseFloat(item.total),
        })).reverse(); // prikazati od najstarijeg ka najnovijem
        setMonthlyEarnings(formatted);
      } catch (err) {
        if (err.response?.status === 403) {
          // Nije kreator – ignoriši
        } else {
          notifications.show({ title: "Greška", message: "Ne mogu da učitam mesečne zarade", color: "red" });
        }
      }
    };
    fetchMonthlyEarnings();
  }, []);

  // Dohvatanje kurseva (postojeće)
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

  // Dohvatanje nivoa (postojeće)
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

  const convertAmount = (amountInEur) => {
    if (selectedCurrency === 'EUR' || !currencyRates?.rates) return amountInEur;
    const rate = currencyRates.rates[selectedCurrency];
    return rate ? amountInEur * rate : amountInEur;
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

          {/* Tabela nivoa */}
          <Table striped highlightOnHover withTableBorder>
            {/* ... isti kao ranije ... */}
          </Table>

          {/* Zarada po nivoima (postojeća) */}
          {earnings && (
            <div style={{ marginTop: 32 }}>
              <Title order={3}>Zarada od pretplata (po nivoima)</Title>
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

              {/* Nova sekcija: Mesečna dinamika zarade */}
              {monthlyEarnings.length > 0 && (
                <>
                  <Title order={3} mt="xl" mb="md">
                    Mesečna dinamika zarade
                  </Title>
                  <Card withBorder shadow="sm" radius="md" padding="md">
                    <Group justify="flex-end" mb="md">
                      <Select
                        size="xs"
                        value={viewMode}
                        onChange={setViewMode}
                        data={[
                          { value: 'chart', label: 'Grafikon' },
                          { value: 'table', label: 'Tabela' },
                        ]}
                      />
                    </Group>
                    {viewMode === 'chart' ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={monthlyEarnings}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${convertAmount(value).toFixed(2)} ${selectedCurrency}`} />
                          <Legend />
                          <Bar dataKey="total" fill="#8884d8" name="Zarada" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Mesec</Table.Th>
                            <Table.Th>Zarada (EUR)</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {monthlyEarnings.map((item) => (
                            <Table.Tr key={item.month}>
                              <Table.Td>{item.month}</Table.Td>
                              <Table.Td>{item.total.toFixed(2)} €</Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    )}
                  </Card>
                </>
              )}

              {/* Konverzija valuta (postojeća) */}
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