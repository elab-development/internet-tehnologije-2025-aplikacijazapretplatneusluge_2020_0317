import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Loader,
  Alert,
  Divider,
  Modal,
  Textarea,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import api from "../api/api";
import Slider from "../components/Slider";
import { getAuth, saveAuth, clearAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [becomeCreatorModal, setBecomeCreatorModal] = useState(false);
  const [updateCreatorModal, setUpdateCreatorModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Forma za ažuriranje korisničkog profila
  const userForm = useForm({
    initialValues: { name: "", email: "", password: "" },
    validate: {
      email: (val) => (val && !/^\S+@\S+$/.test(val) ? "Neispravan email" : null),
      password: (val) => (val && val.length < 8 ? "Lozinka mora imati bar 8 karaktera" : null),
    },
  });

  // Forma za postajanje kreatora
  const becomeCreatorForm = useForm({
    initialValues: { naziv_stranice: "", opis: "" },
    validate: {
      naziv_stranice: (val) => (!val ? "Naziv stranice je obavezan" : null),
    },
  });

  // Forma za ažuriranje kreatorskog profila
  const updateCreatorForm = useForm({
    initialValues: { naziv_stranice: "", opis: "" },
    validate: {
      naziv_stranice: (val) => (!val ? "Naziv stranice je obavezan" : null),
    },
  });

  // Dohvatanje podataka
  const fetchData = async () => {
    setLoading(true);
    try {
      // Dohvati korisnika
      const userRes = await api.get("/me");
      console.log("Odgovor /me:", userRes.data);
      setUser(userRes.data);

      // Pokušaj dohvatiti kreatorski profil (ako postoji)
      try {
        const creatorRes = await api.get("/creators/profile");
        setCreator(creatorRes.data.creator);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
        setCreator(null);
      }

      // Popuni forme sa trenutnim podacima
      userForm.setValues({
        name: userRes.data.name,
        email: userRes.data.email,
        password: "",
      });
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Greška",
        message: "Ne mogu da učitam podatke profila.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ažuriranje korisnika
  const handleUserUpdate = async (values) => {
    setUpdating(true);
    try {
      const payload = {};
      if (values.name !== user.name) payload.name = values.name;
      if (values.email !== user.email) payload.email = values.email;
      if (values.password) payload.password = values.password;

      if (Object.keys(payload).length === 0) {
        notifications.show({ title: "Info", message: "Nema promena za čuvanje." });
        setUpdating(false);
        return;
      }

      const res = await api.put("/users/profile", payload);
      // Ažuriraj sessionStorage
      const auth = getAuth();
      if (auth) {
        saveAuth({ ...auth, user: res.data.user });
      }
      setUser(res.data.user);
      notifications.show({ title: "Uspeh", message: "Profil je ažuriran.", color: "green" });
      userForm.setValues({ ...values, password: "" });
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Ažuriranje nije uspelo.",
        color: "red",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Brisanje naloga
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const password = window.prompt("Unesite lozinku za potvrdu brisanja naloga:");
      if (!password) {
        setDeleting(false);
        return;
      }
      await api.delete("/users/me", { data: { password } });
      clearAuth();
      notifications.show({ title: "Uspeh", message: "Vaš nalog je obrisan.", color: "green" });
      navigate("/auth", { replace: true });
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Brisanje nije uspelo. Proverite lozinku.",
        color: "red",
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  // Postani kreator
  const handleBecomeCreator = async (values) => {
    setUpdating(true);
    try {
      const res = await api.post("/users/become-creator", values);
      notifications.show({ title: "Uspeh", message: res.data.message, color: "green" });
      // Ažuriraj sessionStorage – korisnikov tip je sada 'oba'
      const auth = getAuth();
      if (auth) {
        const updatedUser = res.data.user;
        saveAuth({ ...auth, user: updatedUser });
        setUser(updatedUser);
      }
      setCreator(res.data.creator);
      setBecomeCreatorModal(false);
      becomeCreatorForm.reset();
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Nadogradnja nije uspela.",
        color: "red",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Ažuriranje kreatora
  const handleUpdateCreator = async (values) => {
    setUpdating(true);
    try {
      const res = await api.put("/creators/profile", values);
      setCreator(res.data.creator);
      notifications.show({ title: "Uspeh", message: "Kreatorski profil ažuriran.", color: "green" });
      setUpdateCreatorModal(false);
    } catch (err) {
      notifications.show({
        title: "Greška",
        message: err.response?.data?.message || "Ažuriranje nije uspelo.",
        color: "red",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Pomocna funkcija za prikaz tipa korisnika
  const tipBadge = (tip) => {
    let color = "gray";
    let label = tip;
    if (tip === "patron") { color = "green"; label = "Patron"; }
    else if (tip === "kreator") { color = "orange"; label = "Kreator"; }
    else if (tip === "oba") { color = "violet"; label = "Patron i kreator"; }
    return <Badge color={color} size="lg">{label}</Badge>;
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

if (!user) {
    return (
        <div style={{ display: "flex" }}>
        <Slider />
        <div style={{ flex: 1, padding: 24 }}>
            <Alert color="red" title="Greška">
            Korisnički podaci nisu dostupni. Pokušajte ponovo.
            </Alert>
        </div>
        </div>
    );
}

  const isCreator = user?.tip === "kreator" || user?.tip === "oba";

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="md">
          <Title order={2} mb="lg">
            Moj profil
          </Title>

          {/* KARTICA SA KORISNIČKIM PODACIMA */}
          <Card withBorder shadow="sm" radius="md" padding="lg" mb="xl">
            <Group justify="space-between" align="center" mb="md">
              <Title order={3}>Korisnički nalog</Title>
              {tipBadge(user.data.role)}
            </Group>
            <Stack gap="xs">
              <Text><strong>Ime:</strong> {user.data.name}</Text>
              <Text><strong>Email:</strong> {user.data.email}</Text>
              <Group gap="xs" align="center">
                <strong>Tip naloga:</strong>
                {tipBadge(user.data.tip)}
                </Group>
            </Stack>
            <Divider my="md" />
            <Title order={4} mb="sm">Izmena podataka</Title>
            <form onSubmit={userForm.onSubmit(handleUserUpdate)}>
              <Stack>
                <TextInput
                  label="Ime i prezime"
                  placeholder="Vaše ime"
                  {...userForm.getInputProps("name")}
                />
                <TextInput
                  label="Email adresa"
                  placeholder="email@example.com"
                  {...userForm.getInputProps("email")}
                />
                <PasswordInput
                  label="Nova lozinka (ostavite prazno ako ne želite da menjate)"
                  placeholder="Nova lozinka"
                  {...userForm.getInputProps("password")}
                />
                <Button type="submit" loading={updating}>
                  Sačuvaj izmene
                </Button>
              </Stack>
            </form>
          </Card>

          {/* KREATORSKI PROFIL (ako postoji) */}
          {creator  && (
            <Card withBorder shadow="sm" radius="md" padding="lg" mb="xl">
              <Group justify="space-between" align="center" mb="md">
                <Title order={3}>Kreatorski profil</Title>
                <Button variant="light" onClick={() => setUpdateCreatorModal(true)}>
                  Uredi kreatora
                </Button>
              </Group>
              <Stack gap="xs">
                <Text>
                  <strong>Naziv stranice:</strong> {creator.naziv_stranice}
                </Text>
                <Text>
                  <strong>Opis:</strong> {creator.opis || "Nema opisa."}
                </Text>
              </Stack>
            </Card>
          )}

          {/* POSTANI KREATOR – samo za patrone */}
          {user.data.tip === "patron" && (
            <Card withBorder shadow="sm" radius="md" padding="lg" mb="xl">
              <Title order={3} mb="md">
                Postanite kreator
              </Title>
              <Text mb="md">
                Kao kreator možete da delite sadržaj i primate pretplate od svojih pratilaca.
              </Text>
              <Button onClick={() => setBecomeCreatorModal(true)}>Postani kreator</Button>
            </Card>
          )}

          {/* OPASNA ZONA – brisanje naloga */}
          <Card withBorder shadow="sm" radius="md" padding="lg" style={{ borderColor: "red" }}>
            <Title order={3} c="red" mb="md">
              Brisanje naloga
            </Title>
            <Text mb="md">
              Brisanjem naloga trajno gubite sve podatke. Ova akcija se ne može opozvati.
            </Text>
            <Button color="red" onClick={() => setDeleteConfirmOpen(true)} loading={deleting}>
              Obriši moj nalog
            </Button>
          </Card>

          {/* MODALI */}
          <Modal opened={becomeCreatorModal} onClose={() => setBecomeCreatorModal(false)} title="Postani kreator" centered>
            <form onSubmit={becomeCreatorForm.onSubmit(handleBecomeCreator)}>
              <Stack>
                <TextInput label="Naziv stranice" {...becomeCreatorForm.getInputProps("naziv_stranice")} required />
                <Textarea label="Opis (opciono)" {...becomeCreatorForm.getInputProps("opis")} />
                <Button type="submit" loading={updating}>Kreiraj profil</Button>
              </Stack>
            </form>
          </Modal>

          <Modal opened={updateCreatorModal} onClose={() => setUpdateCreatorModal(false)} title="Uredi kreatorski profil" centered>
            <form onSubmit={updateCreatorForm.onSubmit(handleUpdateCreator)}>
              <Stack>
                <TextInput label="Naziv stranice" {...updateCreatorForm.getInputProps("naziv_stranice")} required />
                <Textarea label="Opis" {...updateCreatorForm.getInputProps("opis")} />
                <Button type="submit" loading={updating}>Sačuvaj</Button>
              </Stack>
            </form>
          </Modal>

          <Modal opened={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Brisanje naloga" centered>
            <Text mb="md">
              Ova akcija je trajna. Kliknite na "Obriši" i zatim unesite vašu lozinku za potvrdu.
            </Text>
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setDeleteConfirmOpen(false)}>Otkaži</Button>
              <Button color="red" onClick={handleDeleteAccount} loading={deleting}>Obriši</Button>
            </Group>
          </Modal>
        </Container>
      </div>
    </div>
  );
}