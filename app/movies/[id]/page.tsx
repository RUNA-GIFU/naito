'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container, Typography, Box, Paper, Button, Rating, Alert, CircularProgress, Divider, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';

interface Movie {
  id: number; title: string; genres: string; director: string; actors: string; release_year: number | null;
  country: string; movie_poster: string | null; rating: number | null; impressions: string;
  watch_method: string; watched_date: string | null;
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [editMovie, setEditMovie] = useState<Partial<Movie> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      setIsLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/movies/${id}/`);
        if (!response.ok) throw new Error('映画データの読み込みに失敗しました。');
        const data = await response.json();
        setMovie(data);
        setEditMovie(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('映画データの読み込み中に不明なエラーが発生しました。');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleEditToggle = () => setIsEditing(!isEditing);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditMovie(prev => (prev ? { ...prev, [name]: value } : null));
  };
  const handleRatingChange = (event: React.SyntheticEvent<Element, Event>, newValue: number | null) => {
    setEditMovie(prev => (prev ? { ...prev, rating: newValue } : null));
  };
  
  const handleSave = async () => {
    if (!editMovie) return;
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      // 注意：画像は編集機能では更新しないシンプルな実装です
      const response = await fetch(`${backendUrl}/api/movies/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMovie),
      });
      if (!response.ok) throw new Error('更新に失敗しました。');
      const updatedMovie = await response.json();
      setMovie(updatedMovie);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('更新中に不明なエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDialogOpen = () => setOpenDeleteDialog(true);
  const handleDeleteDialogClose = () => setOpenDeleteDialog(false);
  const handleDelete = async () => {
    handleDeleteDialogClose();
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      await fetch(`${backendUrl}/api/movies/${id}/`, { method: 'DELETE' });
      router.push('/movies/list');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('削除中に不明なエラーが発生しました。');
      }
      setIsLoading(false);
    }
  };
  
  if (isLoading && !movie) { return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>; }
  if (error || !movie) { return <Container sx={{ py: 4, textAlign: 'center' }}><Alert severity="error">{error || '映画が見つかりません。'}</Alert></Container>; }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          {isEditing ? (
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>編集モード</Typography>
              <TextField name="title" label="タイトル" defaultValue={editMovie?.title} onChange={handleChange} fullWidth margin="normal" />
              <TextField name="genres" label="ジャンル" defaultValue={editMovie?.genres} onChange={handleChange} fullWidth margin="normal" />
              <TextField name="director" label="監督" defaultValue={editMovie?.director} onChange={handleChange} fullWidth margin="normal" />
              <TextField name="actors" label="俳優" defaultValue={editMovie?.actors} onChange={handleChange} fullWidth margin="normal" />
              <TextField name="release_year" label="公開年" type="number" defaultValue={editMovie?.release_year} onChange={handleChange} fullWidth margin="normal" />
              <TextField name="country" label="制作国" defaultValue={editMovie?.country} onChange={handleChange} fullWidth margin="normal" />
              <TextField name="watched_date" label="視聴日" type="date" defaultValue={editMovie?.watched_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth margin="normal" />
              <TextField name="watch_method" label="視聴方法" defaultValue={editMovie?.watch_method} onChange={handleChange} fullWidth margin="normal" />
              <Box sx={{ my: 2 }}><Typography component="legend">評価</Typography><Rating name="rating" value={editMovie?.rating || null} precision={0.5} onChange={handleRatingChange} /></Box>
              <TextField name="impressions" label="感想" multiline rows={4} defaultValue={editMovie?.impressions} onChange={handleChange} fullWidth margin="normal" />
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleEditToggle}>キャンセル</Button>
                <Button variant="contained" onClick={handleSave} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : '保存'}</Button>
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                <Box sx={{ width: { xs: '100%', sm: '300px' }, flexShrink: 0, textAlign: 'center' }}>
                  <Image src={movie.movie_poster || '/placeholder_movie.jpg'} alt={movie.title} width={300} height={450} priority style={{ width: '100%', height: 'auto', borderRadius: '8px' }}/>
                </Box>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">{movie.title}</Typography>
                  {movie.rating !== null && <Rating value={movie.rating} precision={0.5} readOnly size="large" sx={{ mb: 2 }} />}
                  {movie.genres && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>{movie.genres.split(',').map(g => <Chip key={g} label={g.trim()} />)}</Box>}
                  <Typography><strong>監督:</strong> {movie.director || '情報なし'}</Typography>
                  <Typography><strong>俳優:</strong> {movie.actors || '情報なし'}</Typography>
                  <Typography><strong>公開年:</strong> {movie.release_year || '情報なし'}</Typography>
                  <Typography><strong>制作国:</strong> {movie.country || '情報なし'}</Typography>
                  <Typography><strong>視聴日:</strong> {movie.watched_date || '情報なし'}</Typography>
                  <Typography><strong>視聴方法:</strong> {movie.watch_method || '情報なし'}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 4 }} />
              <Box><Typography variant="h5" gutterBottom>感想</Typography><Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{movie.impressions || '感想はありません。'}</Typography></Box>
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleEditToggle}>編集</Button>
                <Button variant="contained" color="error" onClick={handleDeleteDialogOpen}>削除</Button>
              </Box>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><Button component={Link} href="/movies/list" variant="text">映画リストに戻る</Button></Box>
            </>
          )}
        </Paper>
      </Container>
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}><DialogTitle>映画の記録を削除しますか？</DialogTitle><DialogContent><DialogContentText>「{movie.title}」の記録を完全に削除します。この操作は元に戻せません。</DialogContentText></DialogContent><DialogActions><Button onClick={handleDeleteDialogClose}>キャンセル</Button><Button onClick={handleDelete} color="error" disabled={isLoading}>{isLoading ? '削除中...' : '削除'}</Button></DialogActions></Dialog>
    </>
  );
}
