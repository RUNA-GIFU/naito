'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container, Typography, Box, Card, CardContent, Button, Rating, Alert, CircularProgress, Grid
} from '@mui/material';

interface Movie {
  id: number;
  title: string;
  movie_poster: string | null;
  rating: number | null;
  watched_date: string | null;
}

export default function MovieListPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/movies/`);
        if (!response.ok) throw new Error('データの読み込みに失敗しました。');
        const data = await response.json();
        setMovies(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('不明なエラーが発生しました。');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (isLoading) { return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>; }
  if (error) { return <Container sx={{ py: 4, textAlign: 'center' }}><Alert severity="error">エラー: {error}</Alert></Container>; }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">映画リスト</Typography>
        <Button component={Link} href="/movies/record" variant="contained" size="large" sx={{ mt: 2 }}>新しい映画を記録する</Button>
      </Box>
      {movies.length === 0 ? (
        <Typography align="center" color="text.secondary">まだ記録された映画がありません。</Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {movies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <Link href={`/movies/${movie.id}`} passHref style={{ textDecoration: 'none' }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: 6 } }}>
                  <Box sx={{ position: 'relative', width: '100%', paddingTop: '150%' }}>
                    <Image
                      src={movie.movie_poster || '/placeholder_movie.jpg'}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography gutterBottom variant="h6" component="div" fontWeight="bold">{movie.title}</Typography>
                    {movie.watched_date && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>視聴日: {movie.watched_date}</Typography>}
                    {movie.rating !== null && <Rating value={movie.rating} precision={0.5} readOnly />}
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Button component={Link} href="/" variant="text">トップページに戻る</Button>
      </Box>
    </Container>
  );
}
