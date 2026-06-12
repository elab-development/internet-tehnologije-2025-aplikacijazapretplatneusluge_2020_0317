import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Loader,
  Alert,
  SimpleGrid,
  Card,
  Group,
  Button,
  Badge,
  Stack,
  Divider,
  Modal,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import api from "../api/api";
import Slider from "../components/Slider";
import PostCard from "../components/PostCard";
import { getAuth } from "../utils/auth";

export default function CreatorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingTierId, setPendingTierId] = useState(null);
  const auth = getAuth();
  const isOwnPage = auth?.user?.creator?.id === Number(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorRes, postsRes] = await Promise.all([
          api.get(`/creators/${id}`),
          api.get(`/creators/${id}/posts`),
        ]);
        setCreator(creatorRes.data.kreator);
        setTiers(creatorRes.data.kreator.sub_levels || []);
        setUserSubscription(creatorRes.data.user_subscription);
        setPosts(postsRes.data.objave || []);
      } catch (err) {
        console.error(err);
        notifications.show({ title: "Greška", message: "Ne mogu da učitam podatke", color: "red" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubscribeClick = (nivoId) => {
    // If not logged in, redirect to auth
    if (!auth) {
      navigate("/auth");
      return;
    }

    // If already subscribed to this tier, do nothing
    const currentTierId = userSubscription?.nivo_id;
    if (currentTierId === nivoId) return;

    // If no current subscription or different tier, show confirmation modal
    setPendingTierId(nivoId);
    setConfirmModalOpen(true);
  };

  const confirmSubscription = async () => {
    setConfirmModalOpen(false);
    setSubscribing(true);
    try {
      if (userSubscription) {
        // Update existing subscription
        await api.put(`/subscriptions/${userSubscription.id}`, { nivo_id: pendingTierId });
      } else {
        // Create new subscription
        await api.post(`/creators/${id}/subscribe`, { nivo_id: pendingTierId });
      }
      notifications.show({ title: "Uspeh", message: "Nivo pretplate je promenjen", color: "green" });
      // Refresh subscription status
      const res = await api.get(`/creators/${id}`);
      setUserSubscription(res.data.user_subscription);
    } catch (err) {
      const msg = err.response?.data?.message || "Greška pri promeni nivoa";
      notifications.show({ title: "Greška", message: msg, color: "red" });
    } finally {
      setSubscribing(false);
      setPendingTierId(null);
    }
  };

  const isSubscribedToTier = (tierId) => {
    return userSubscription && userSubscription.nivo_id === tierId;
  };
  const isSubscribedToFree = () => userSubscription && userSubscription.nivo_id === null;
  const getButtonLabel = (tierId) => {
    if (isSubscribedToTier(tierId)) return "Trenutni nivo";
    if (userSubscription && userSubscription.nivo_id !== null && userSubscription.nivo_id !== tierId) return "Promeni na ovaj nivo";
    return "Pretplati se";
  };

  if (loading) return <div style={{ display: "flex" }}><Slider /><div style={{ flex: 1, padding: 24 }}><Loader /></div></div>;
  if (!creator) return <div style={{ display: "flex" }}><Slider /><div style={{ flex: 1, padding: 24 }}><Alert color="red">Kreator nije pronađen</Alert></div></div>;

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={1}>{creator.naziv_stranice}</Title>
          <Text c="dimmed" mb="lg">{creator.opis}</Text>

          <Divider my="lg" label="Nivoi pretplate" labelPosition="center" />

          {!isOwnPage ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {/* Free tier */}
              <Card withBorder shadow="sm" radius="md" style={{ backgroundColor: isSubscribedToFree() ? "#e0f2fe" : "white" }}>
                <Stack>
                  <Title order={3}>Bez nivoa</Title>
                  <Text size="sm">Podržite kreatora bez mesečne obaveze.</Text>
                  <Button
                    variant={isSubscribedToFree() ? "filled" : "light"}
                    color={isSubscribedToFree() ? "green" : "blue"}
                    onClick={() => handleSubscribeClick(null)}
                    loading={subscribing}
                    disabled={isSubscribedToFree()}
                  >
                    {getButtonLabel(null)}
                  </Button>
                </Stack>
              </Card>

              {/* Paid tiers */}
              {tiers.map(tier => (
                <Card key={tier.id} withBorder shadow="sm" radius="md" style={{ backgroundColor: isSubscribedToTier(tier.id) ? "#e0f2fe" : "white" }}>
                  <Stack>
                    <Title order={3}>{tier.naziv}</Title>
                    <Badge size="lg" color="blue">{tier.cena_mesecno} EUR/mesečno</Badge>
                    <Text size="sm">{tier.opis || "Nema dodatnog opisa."}</Text>
                    <Button
                      variant={isSubscribedToTier(tier.id) ? "filled" : "light"}
                      color={isSubscribedToTier(tier.id) ? "green" : "blue"}
                      onClick={() => handleSubscribeClick(tier.id)}
                      loading={subscribing}
                      disabled={isSubscribedToTier(tier.id)}
                    >
                      {getButtonLabel(tier.id)}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Alert color="blue" icon="ℹ️">
              Ovo je vaša stranica. Ne možete se pretplatiti na sopstvene nivoe.
            </Alert>
          )}

          <Divider my="lg" label="Objave" labelPosition="center" />

          {posts.length === 0 ? (
            <Alert color="blue">Trenutno nema objava za prikaz.</Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {posts.map(post => (
                <PostCard key={post.id} post={post} showActions={false} showReadMore={true} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </div>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Potvrda promene nivoa"
        centered
      >
        <Text mb="md">Da li ste sigurni da želite da promenite nivo pretplate?</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={() => setConfirmModalOpen(false)}>Otkaži</Button>
          <Button color="blue" onClick={confirmSubscription} loading={subscribing}>Potvrdi</Button>
        </Group>
      </Modal>
    </div>
  );
}