import {
  Container,
  Title,
  Button,
  Group,
  Table,
  Badge,
  Loader,
  Alert,
  Modal,
  TextInput,
  Select,
  Text,
  Stack,
  Pagination,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconRefresh } from "@tabler/icons-react";
import api from "../api/api";
import Slider from "../components/Slider";

export default function HomeAdmin() {
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'creators'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ data: [], current_page: 1, last_page: 1 });
  const [creators, setCreators] = useState({ data: [], current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'user' or 'creator'
  const [currentItem, setCurrentItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form for user edit (role & tip)
  const userForm = useForm({
    initialValues: { role: "user", tip: "patron" },
    validate: {
      role: (v) => (!v ? "Obavezno" : null),
      tip: (v) => (!v ? "Obavezno" : null),
    },
  });

  // Form for creator edit (naziv_stranice, opis)
  const creatorForm = useForm({
    initialValues: { naziv_stranice: "", opis: "" },
    validate: {
      naziv_stranice: (v) => (!v ? "Obavezno" : null),
    },
  });

  // Fetch statistics
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam statistiku.",
        color: "red",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch users (paginated)
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&per_page=10`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam korisnike.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch creators (paginated)
  const fetchCreators = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/creators?page=${page}&per_page=10`);
      setCreators(res.data);
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam kreatore.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(users.current_page);
    } else {
      fetchCreators(creators.current_page);
    }
  }, [activeTab]);

  // Handle page change
  const handlePageChange = (page) => {
    if (activeTab === "users") {
      fetchUsers(page);
    } else {
      fetchCreators(page);
    }
  };

  // Open edit modal for user
  const openEditUser = (user) => {
    setModalMode("user");
    setCurrentItem(user);
    userForm.setValues({ role: user.role, tip: user.tip });
    setModalOpen(true);
  };

  // Open edit modal for creator
  const openEditCreator = (creator) => {
    setModalMode("creator");
    setCurrentItem(creator);
    creatorForm.setValues({
      naziv_stranice: creator.naziv_stranice,
      opis: creator.opis || "",
    });
    setModalOpen(true);
  };

  // Submit user edit
  const handleUserUpdate = async (values) => {
    try {
      await api.put(`/admin/users/${currentItem.id}/role`, values);
      notifications.show({
        title: "Uspeh",
        message: "Korisnik je ažuriran.",
        color: "green",
      });
      setModalOpen(false);
      fetchUsers(users.current_page);
      fetchStats(); // osveži statistiku (možda se promenio broj korisnika)
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Ažuriranje nije uspelo.",
        color: "red",
      });
    }
  };

  // Submit creator edit
  const handleCreatorUpdate = async (values) => {
    try {
      await api.put(`/admin/creators/${currentItem.id}`, values);
      notifications.show({
        title: "Uspeh",
        message: "Kreator je ažuriran.",
        color: "green",
      });
      setModalOpen(false);
      fetchCreators(creators.current_page);
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Ažuriranje nije uspelo.",
        color: "red",
      });
    }
  };

  // Confirm delete
  const confirmDelete = (item, type) => {
    setItemToDelete({ id: item.id, type });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    const { id, type } = itemToDelete;
    setDeletingId(id);
    try {
      if (type === "user") {
        await api.delete(`/admin/users/${id}`);
        notifications.show({
          title: "Uspeh",
          message: "Korisnik obrisan.",
          color: "green",
        });
        fetchUsers(users.current_page);
        fetchStats();
      } else {
        // Creators can be deleted? Backend has destroyUser only for users, not for creators.
        // The spec says edit for creators, not delete. So we won't implement delete for creators.
        // But just in case, we'll not call any API for creators.
        notifications.show({
          title: "Informacija",
          message: "Brisanje kreatora nije dozvoljeno preko admin panela.",
          color: "yellow",
        });
      }
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Brisanje nije uspelo.",
        color: "red",
      });
    } finally {
      setDeletingId(null);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Helper for user role badge
  const roleBadge = (role) => (
    <Badge color={role === "admin" ? "red" : "blue"}>{role === "admin" ? "Admin" : "Korisnik"}</Badge>
  );

  const tipBadge = (tip) => {
    let color = "gray";
    if (tip === "patron") color = "green";
    if (tip === "kreator") color = "orange";
    if (tip === "oba") color = "violet";
    return <Badge color={color}>{tip}</Badge>;
  };

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="xl">
          {/* Statistika */}
          <Title order={2} mb="md">
            Admin panel
          </Title>
          {statsLoading ? (
            <Loader />
          ) : stats ? (
            <Group grow mb="xl" style={{ textAlign: "center" }}>
              <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
                <Text size="xl" fw={700}>
                  {stats.total_users}
                </Text>
                <Text size="sm" c="dimmed">
                  Ukupno korisnika
                </Text>
              </div>
              <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
                <Text size="xl" fw={700}>
                  {stats.total_creators}
                </Text>
                <Text size="sm" c="dimmed">
                  Ukupno kreatora
                </Text>
              </div>
              <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
                <Text size="xl" fw={700}>
                  {stats.active_subscriptions}
                </Text>
                <Text size="sm" c="dimmed">
                  Aktivne pretplate
                </Text>
              </div>
              <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
                <Text size="xl" fw={700}>
                  {stats.total_revenue} €
                </Text>
                <Text size="sm" c="dimmed">
                  Ukupan prihod
                </Text>
              </div>
            </Group>
          ) : (
            <Alert color="red">Statistika nije dostupna.</Alert>
          )}

          {/* Dugmad za prebacivanje */}
          <Group mb="md">
            <Button
              variant={activeTab === "users" ? "filled" : "light"}
              onClick={() => setActiveTab("users")}
            >
              Svi korisnici
            </Button>
            <Button
              variant={activeTab === "creators" ? "filled" : "light"}
              onClick={() => setActiveTab("creators")}
            >
              Svi kreatori
            </Button>
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                if (activeTab === "users") fetchUsers(users.current_page);
                else fetchCreators(creators.current_page);
                fetchStats();
              }}
            >
              Osveži
            </Button>
          </Group>

          {/* Tabela korisnika */}
          {activeTab === "users" && (
            <>
              {loading ? (
                <Loader />
              ) : (
                <>
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Ime</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Tip</Table.Th>
                        <Table.Th>Rola</Table.Th>
                        <Table.Th>Akcije</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {users.data.map((user) => (
                        <Table.Tr key={user.id}>
                          <Table.Td>{user.id}</Table.Td>
                          <Table.Td>{user.name}</Table.Td>
                          <Table.Td>{user.email}</Table.Td>
                          <Table.Td>{tipBadge(user.tip)}</Table.Td>
                          <Table.Td>{roleBadge(user.role)}</Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => openEditUser(user)}
                              >
                                <IconEdit size={18} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => confirmDelete(user, "user")}
                              >
                                <IconTrash size={18} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  {users.last_page > 1 && (
                    <Pagination
                      total={users.last_page}
                      value={users.current_page}
                      onChange={handlePageChange}
                      mt="md"
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Tabela kreatora */}
          {activeTab === "creators" && (
            <>
              {loading ? (
                <Loader />
              ) : (
                <>
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Naziv stranice</Table.Th>
                        <Table.Th>Opis</Table.Th>
                        <Table.Th>Korisnik (ID)</Table.Th>
                        <Table.Th>Akcije</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {creators.data.map((creator) => (
                        <Table.Tr key={creator.id}>
                          <Table.Td>{creator.id}</Table.Td>
                          <Table.Td>{creator.naziv_stranice}</Table.Td>
                          <Table.Td>{creator.opis || "-"}</Table.Td>
                          <Table.Td>
                            {creator.user?.name} (#{creator.user?.id})
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openEditCreator(creator)}
                            >
                              <IconEdit size={18} />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  {creators.last_page > 1 && (
                    <Pagination
                      total={creators.last_page}
                      value={creators.current_page}
                      onChange={handlePageChange}
                      mt="md"
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Modal za izmenu korisnika */}
          <Modal
            opened={modalOpen && modalMode === "user"}
            onClose={() => setModalOpen(false)}
            title="Izmena korisnika"
            centered
          >
            <form onSubmit={userForm.onSubmit(handleUserUpdate)}>
              <Stack>
                <Select
                  label="Rola"
                  data={[
                    { value: "user", label: "Korisnik" },
                    { value: "admin", label: "Admin" },
                  ]}
                  {...userForm.getInputProps("role")}
                />
                <Select
                  label="Tip"
                  data={[
                    { value: "patron", label: "Patron" },
                    { value: "kreator", label: "Kreator" },
                    { value: "oba", label: "Oba" },
                  ]}
                  {...userForm.getInputProps("tip")}
                />
                <Button type="submit">Sačuvaj</Button>
              </Stack>
            </form>
          </Modal>

          {/* Modal za izmenu kreatora */}
          <Modal
            opened={modalOpen && modalMode === "creator"}
            onClose={() => setModalOpen(false)}
            title="Izmena kreatora"
            centered
          >
            <form onSubmit={creatorForm.onSubmit(handleCreatorUpdate)}>
              <Stack>
                <TextInput
                  label="Naziv stranice"
                  {...creatorForm.getInputProps("naziv_stranice")}
                  required
                />
                <TextInput
                  label="Opis"
                  {...creatorForm.getInputProps("opis")}
                />
                <Button type="submit">Sačuvaj</Button>
              </Stack>
            </form>
          </Modal>

          {/* Modal za potvrdu brisanja */}
          <Modal
            opened={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            title="Potvrda brisanja"
            centered
          >
            <Text mb="md">Da li ste sigurni da želite da obrišete ovaj nalog?</Text>
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setDeleteConfirmOpen(false)}>
                Otkaži
              </Button>
              <Button color="red" onClick={handleDelete} loading={deletingId !== null}>
                Obriši
              </Button>
            </Group>
          </Modal>
        </Container>
      </div>
    </div>
  );
}