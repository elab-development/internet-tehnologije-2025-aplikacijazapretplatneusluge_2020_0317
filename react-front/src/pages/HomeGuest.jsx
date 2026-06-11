import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  SimpleGrid,
  Tabs,
  Loader,
  Alert,
  Group,
  Stack,
  Divider,
  Box,
  Badge,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { IconUsers, IconArticle, IconHeart, IconLogin, IconCalendar, IconEye, IconLock } from "@tabler/icons-react";
import api from "../api/api";
import RandomQuote from "../components/RandomQuote";

// Helper za prikaz ikonice pristupa
const getAccessIcon = (pristup) => {
  switch (pristup) {
    case "javno": return <IconEye size={14} />;
    case "pretplatnici": return <IconUsers size={14} />;
    case "nivo": return <IconLock size={14} />;
    default: return null;
  }
};

// Komponenta za prikaz objave u kartici
const PostCard = ({ post }) => (
  <Card withBorder shadow="sm" radius="md" padding="lg" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <Text fw={700} size="lg" lineClamp={1}>{post.naslov}</Text>
    <Text size="xs" c="dimmed" mt={4}>
      {new Date(post.datum_objave).toLocaleDateString()}
    </Text>
    <Text size="sm" mt="sm" lineClamp={3}>{post.sadrzaj}</Text>
    <Group gap="xs" mt="auto" pt="sm">
      {getAccessIcon(post.pristup)}
      <Badge size="xs" color={post.pristup === "javno" ? "green" : "gray"}>
        {post.pristup === "javno" ? "Javno" : "Ograničeno"}
      </Badge>
    </Group>
  </Card>
);

export default function HomeGuest() {
  const [creators, setCreators] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  // Dohvatanje svih kreatora
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await api.get("/creators");
        setCreators(res.data.kreatori || []);
      } catch (err) {
        console.error(err);
        setError("Ne mogu da učitam kreatore.");
      } finally {
        setLoadingCreators(false);
      }
    };
    fetchCreators();
  }, []);

  // Dohvatanje javnih objava od svih kreatora (ograničeno na 3 po kreatoru)
  useEffect(() => {
    const fetchAllPublicPosts = async () => {
      if (creators.length === 0) return;
      setLoadingPosts(true);
      try {
        // Za svakog kreatora dohvati javne objave (samo prvu stranicu, per_page=3)
        const postsPromises = creators.map(creator =>
          api.get(`/creators/${creator.id}/posts?per_page=3`).then(res => res.data.objave|| [])
        );
        const postsArrays = await Promise.all(postsPromises);
        const allPosts = postsArrays.flat().filter(post => post.pristup === "javno");
        // Sortiraj po datumu opadajuće
        allPosts.sort((a, b) => new Date(b.datum_objave) - new Date(a.datum_objave));
        setPublicPosts(allPosts.slice(0, 12)); // prikaži najviše 12 objava
      } catch (err) {
        console.error(err);
        setError("Ne mogu da učitam objave.");
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchAllPublicPosts();
  }, [creators]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Leva traka (kao Slider) */}
      <Box
        style={{
          width: 280,
          minWidth: 280,
          height: "100vh",
          position: "sticky",
          top: 0,
          padding: 20,
          background: "rgba(255,255,255,0.88)",
          borderRight: "1px solid rgba(11,31,59,0.12)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <img src="/logo.png" alt="Patron Star" style={{ width: 140, height: 44, objectFit: "contain" }} />
        <Divider />
        <div>
          <Text fw={700} size="lg" mb="sm">Funkcionalnosti za ulogovane korisnike</Text>
          <Stack gap="xs">
            <Group gap="xs"><IconUsers size={16} />Pratite kreatore</Group>
            <Group gap="xs"><IconArticle size={16} />Pristupite ekskluzivnom sadržaju</Group>
            <Group gap="xs"><IconHeart size={16} />Podržite rad kreatora</Group>
          </Stack>
        </div>
        <Divider />
        <RandomQuote />
        <Divider />
        <Button
          component={Link}
          to="/auth"
          variant="light"
          leftSection={<IconLogin size={16} />}
          fullWidth
        >
          Prijavi se / Registruj
        </Button>
      </Box>

      {/* Glavni sadržaj */}
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Dobrodošli na Patron Star</Title>
          <Text mb="xl" c="dimmed">
            Otkrijte kreatore i njihov rad. Pridružite nam se da biste podržali svoje favorite!
          </Text>

          <Tabs defaultValue="posts">
            <Tabs.List grow mb="lg">
              <Tabs.Tab value="posts">Javne objave</Tabs.Tab>
              <Tabs.Tab value="creators">Kreatori</Tabs.Tab>
            </Tabs.List>

            {/* Tab: Javne objave */}
            <Tabs.Panel value="posts">
              {loadingPosts ? (
                <Loader />
              ) : error ? (
                <Alert color="red">{error}</Alert>
              ) : publicPosts.length === 0 ? (
                <Alert color="blue">Trenutno nema javnih objava za prikaz.</Alert>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                  {publicPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </SimpleGrid>
              )}
            </Tabs.Panel>

            {/* Tab: Kreatori */}
            <Tabs.Panel value="creators">
              {loadingCreators ? (
                <Loader />
              ) : error ? (
                <Alert color="red">{error}</Alert>
              ) : creators.length === 0 ? (
                <Alert color="blue">Nema registrovanih kreatora.</Alert>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                  {creators.map(creator => (
                    <Card key={creator.id} withBorder shadow="sm" radius="md" padding="lg">
                      <Text fw={700} size="lg" lineClamp={1}>{creator.naziv_stranice}</Text>
                      <Text size="sm" c="dimmed" lineClamp={3} mt="xs">
                        {creator.opis || "Nema opisa."}
                      </Text>
                      <Group gap="xs" mt="md">
                        <Badge>{creator.subscribers_count || 0} pretplatnika</Badge>
                        <Badge>{creator.posts_count || 0} objava</Badge>
                      </Group>
                      <Button
                        component={Link}
                        to={`/creators/${creator.id}`}
                        variant="light"
                        fullWidth
                        mt="md"
                      >
                        Pogledaj profil
                      </Button>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Tabs.Panel>
          </Tabs>
        </Container>
      </div>
    </div>
  );
}