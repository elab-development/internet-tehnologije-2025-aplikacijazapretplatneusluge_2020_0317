import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Tabs,
  Table,
  Button,
  Group,
  Text,
  Badge,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stack,
  Loader,
  ActionIcon,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import api from "../api/api";
import Slider from "../components/Slider";
import { getAuth } from "../utils/auth";

export default function HomeCreator() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tiers");
  const [tiers, setTiers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentItem, setCurrentItem] = useState(null);

  // Forme
    const tierForm = useForm({
    initialValues: { naziv: "", cena_mesecno: "", opis: "" },
    validate: {
      naziv: (v) => (!v ? "Obavezno" : null),
      cena_mesecno: (v) => (v === "" || v < 0 ? "Mora biti >=0" : null),
    },
  });

  const postForm = useForm({
    initialValues: { naslov: "", sadrzaj: "", pristup: "javno", nivo_pristupa_id: null },
    validate: {
      naslov: (v) => (!v ? "Obavezno" : null),
      sadrzaj: (v) => (!v ? "Obavezno" : null),
    },
  });

  useEffect(() => {
    if (postForm.values.pristup !== 'nivo') {
      postForm.setFieldValue('nivo_pristupa_id', null);
    }
  }, [postForm.values.pristup]);
  // Dohvatanje ID-ja kreatora pre nego što učitamo nivoe/objave
  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await api.get("/creators/profile");
        setCreatorId(res.data.creator.id);
      } catch (err) {
        //if (err.response?.status === 404) {
          // Korisnik nije kreator – to je očekivano, ne prikazujemo dodatnu grešku
        //  setCreatorId(null);
        //} else {
          console.error("Greška pri dohvatanju profila:", err);
          notifications.show({ title: "Greška", message: "Ne može se učitati profil.", color: "red" });
        //}
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [])

  // Učitavanje podataka
   const loadTiers = async () => {
    if (!creatorId) return;
    try {
      const res = await api.get(`/creators/${creatorId}/tiers`);
      setTiers(res.data.sublvls || []);
    } catch (err) {
      notifications.show({ title: "Greška", message: "Ne mogu da učitam nivoe", color: "red" });
    }
  };

  const loadPosts = async () => {
    if (!creatorId) return;
    try {
      const res = await api.get(`/creators/${creatorId}/posts`);
      console.log('Posts response:', res.data);
      setPosts(res.data.objave || []);
    } catch (err) {
      notifications.show({ title: "Greška", message: "Ne mogu da učitam objave", color: "red" });
    }
  };

  useEffect(() => {
    if (!creatorId) return;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadTiers(), loadPosts()]);
      setLoading(false);
    };
    loadData();
  }, [creatorId]);

  if (!loading && !creatorId) {
    return (
      <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
          <Container>
            <Alert color="yellow" title="Niste kreator">
              Vaš nalog nema povezan kreatorski profil. Da biste pristupili ovom panelu, prvo postanite kreator.
            </Alert>
            <Button mt="md" onClick={() => navigate("/become-creator")}>
              Postani kreator
            </Button>
          </Container>
        </div>
      </div>
    );
  }

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

  // Nivoi: dodavanje / izmena / brisanje
  const handleTierSubmit = async (values) => {
    try {
      if (modalMode === "create") {
        await api.post(`/creators/${creatorId}/tiers`, values);
        notifications.show({ title: "Uspeh", message: "Nivo dodat", color: "green" });
      } else {
        await api.put(`/tiers/${currentItem.id}`, values);
        notifications.show({ title: "Uspeh", message: "Nivo izmenjen", color: "green" });
      }
      setModalOpen(false);
      tierForm.reset();
      loadTiers();
    } catch (err) {
      notifications.show({ title: "Greška", message: err.response?.data?.message || "Greška", color: "red" });
    }
  };

  const deleteTier = async (id) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj nivo?")) {
      try {
        await api.delete(`/tiers/${id}`);
        notifications.show({ title: "Uspeh", message: "Nivo obrisan", color: "green" });
        loadTiers();
      } catch (err) {
        notifications.show({ title: "Greška", message: "Brisanje nije uspelo", color: "red" });
      }
    }
  };

  const openTierModal = (tier = null) => {
    if (tier) {
      setModalMode("edit");
      setCurrentItem(tier);
      tierForm.setValues({
        naziv: tier.naziv,
        cena_mesecno: tier.cena_mesecno,
        opis: tier.opis || "",
      });
    } else {
      setModalMode("create");
      setCurrentItem(null);
      tierForm.reset();
    }
    setModalOpen(true);
  };

  // Objave: dodavanje / izmena / brisanje
  const handlePostSubmit = async (values) => {
    try {
      if (modalMode === "create") {
        await api.post(`/creators/${creatorId}/posts`, values);
        notifications.show({ title: "Uspeh", message: "Objava dodata", color: "green" });
      } else {
        await api.put(`/posts/${currentItem.id}`, values);
        notifications.show({ title: "Uspeh", message: "Objava izmenjena", color: "green" });
      }
      setModalOpen(false);
      postForm.reset();
      loadPosts();
    } catch (err) {
      notifications.show({ title: "Greška", message: err.response?.data?.message || "Greška", color: "red" });
    }
  };

  const deletePost = async (id) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovu objavu?")) {
      try {
        await api.delete(`/posts/${id}`);
        notifications.show({ title: "Uspeh", message: "Objava obrisana", color: "green" });
        loadPosts();
      } catch (err) {
        notifications.show({ title: "Greška", message: "Brisanje nije uspelo", color: "red" });
      }
    }
  };

  const openPostModal = (post = null) => {
    if (post) {
      setModalMode("edit");
      setCurrentItem(post);
      postForm.setValues({
        naslov: post.naslov,
        sadrzaj: post.sadrzaj,
        pristup: post.pristup,
        nivo_pristupa_id: post.nivo_pristupa_id,
      });
    } else {
      setModalMode("create");
      setCurrentItem(null);
      postForm.reset();
    }
    setModalOpen(true);
  };

  if (loading) return <div style={{ display: "flex" }}><Slider /><div style={{ flex: 1, padding: 24 }}><Loader /></div></div>;

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Kreatorski panel</Title>

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="tiers">Nivoi pretplate</Tabs.Tab>
              <Tabs.Tab value="posts">Objave</Tabs.Tab>
            </Tabs.List>

            {/* TAB NIVOI */}
            <Tabs.Panel value="tiers" pt="md">
              <Group justify="space-between" mb="md">
                <Text>Upravljajte nivoima pretplate koje nudite svojim pratiocima.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={() => openTierModal()}>
                  Dodaj nivo
                </Button>
              </Group>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Naziv</Table.Th>
                    <Table.Th>Cena (EUR)</Table.Th>
                    <Table.Th>Opis</Table.Th>
                    <Table.Th>Akcije</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tiers.map((tier) => (
                    <Table.Tr key={tier.id}>
                      <Table.Td>{tier.naziv}</Table.Td>
                      <Table.Td>{tier.cena_mesecno}</Table.Td>
                      <Table.Td>{tier.opis || "-"}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" color="blue" onClick={() => openTierModal(tier)}>
                            <IconEdit size={18} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => deleteTier(tier.id)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {tiers.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text c="dimmed">Nemate nijedan nivo. Kliknite na "Dodaj nivo".</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            {/* TAB OBJAVE */}
            <Tabs.Panel value="posts" pt="md">
              <Group justify="space-between" mb="md">
                <Text>Upravljajte objavama koje delite sa svojim pratiocima.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={() => openPostModal()}>
                  Dodaj objavu
                </Button>
              </Group>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Naslov</Table.Th>
                    <Table.Th>Datum</Table.Th>
                    <Table.Th>Pristup</Table.Th>
                    <Table.Th>Akcije</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {posts.map((post) => (
                    <Table.Tr key={post.id}>
                      <Table.Td>{post.naslov}</Table.Td>
                      <Table.Td>{new Date(post.datum_objave).toLocaleDateString()}</Table.Td>
                      <Table.Td><Badge>{post.pristup}</Badge></Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" color="blue" onClick={() => openPostModal(post)}>
                            <IconEdit size={18} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => deletePost(post.id)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {posts.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text c="dimmed">Nemate nijednu objavu. Kliknite na "Dodaj objavu".</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>
          </Tabs>

          {/* MODAL ZA NIVO / OBJAVU */}
          <Modal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            title={modalMode === "create" ? (activeTab === "tiers" ? "Dodaj nivo" : "Dodaj objavu") : (activeTab === "tiers" ? "Izmeni nivo" : "Izmeni objavu")}
            centered
          >
            {activeTab === "tiers" ? (
              <form onSubmit={tierForm.onSubmit(handleTierSubmit)}>
                <Stack>
                  <TextInput label="Naziv" {...tierForm.getInputProps("naziv")} required />
                  <NumberInput label="Cena (EUR)" {...tierForm.getInputProps("cena_mesecno")} required min={0} />
                  <Textarea label="Opis" {...tierForm.getInputProps("opis")} />
                  <Button type="submit">{modalMode === "create" ? "Dodaj" : "Sačuvaj"}</Button>
                </Stack>
              </form>
            ) : (
              <form onSubmit={postForm.onSubmit(handlePostSubmit)}>
                <Stack>
                  <TextInput label="Naslov" {...postForm.getInputProps("naslov")} required />
                  <Textarea label="Sadržaj" {...postForm.getInputProps("sadrzaj")} required minRows={4} />
                  <Select
                    label="Pristup"
                    data={[
                      { value: "javno", label: "Javno" },
                      { value: "pretplatnici", label: "Samo pretplatnici" },
                      { value: "nivo", label: "Određeni nivo" },
                    ]}
                    {...postForm.getInputProps("pristup")}
                  />
                  {postForm.values.pristup === "nivo" && (
                    <Select
                      label="Nivo pretplate"
                      data={tiers.map((t) => ({ value: t.id.toString(), label: t.naziv }))}
                      {...postForm.getInputProps("nivo_pristupa_id")}
                    />
                  )}
                  <Button type="submit">{modalMode === "create" ? "Dodaj" : "Sačuvaj"}</Button>
                </Stack>
              </form>
            )}
          </Modal>
        </Container>
      </div>
    </div>
  );
}