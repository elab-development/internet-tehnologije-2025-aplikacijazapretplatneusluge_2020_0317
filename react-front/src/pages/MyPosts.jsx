import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Loader,
  Alert,
  SimpleGrid
} from "@mantine/core";
import api from "../api/api";
import Slider from "../components/Slider";
import PostCard from "../components/PostCard";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/my-posts");
        setPosts(res.data.posts?.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Ne mogu da učitam objave.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
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

  return (
    <div style={{ display: "flex" }}>
      <Slider />
      <div style={{ flex: 1, padding: 24 }}>
        <Container size="lg">
          <Title order={2} mb="lg">Moje objave</Title>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showReadMore={true}
              />
            ))}
          </SimpleGrid>

          {posts.length === 0 && (
            <Alert color="blue" title="Info" mt="xl">
              Još uvek nemate nijednu objavu. Kliknite na "Dodaj objavu" u kreatorskom panelu.
            </Alert>
          )}
        </Container>
      </div>
    </div>
  );
}