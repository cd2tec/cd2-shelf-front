import React, { useState, useEffect, useContext } from 'react';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button, RadioGroup, Collapse
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { RadioGroupOption, TextField } from '../../../../components/material'

import Page from '../../../../components/Page';
import { PerfilServiceApi, UsuarioAPI, UnidadeAPI, EntidadeAPI, filterErrors, defaultProcessCatch } from '../../../../services/api';
import alerts from '../../../../utils/alerts';
import LoggedContext from '../../../../context/LoggedContext';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	actions: {
		padding: 15,
	}
}));

const Cadastro = ({uuid}) => {
  const loggedUser = useContext(LoggedContext)
	const classes = useStyles();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfis, setPerfis] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [unidadesValue, setUnidadesValue] = useState([]);
  const [perfisValue, setPerfisValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState();
  const [todasUnidades, setTodasUnidades] = useState("todos");

  /* eslint-disable */
  useEffect(() => {
    PerfilServiceApi.list()
      .then(rs => {
        setPerfis(rs.perfis || []);
      })
      .catch(defaultProcessCatch());

    EntidadeAPI.listUnidadesEntidade()
      .then(rs => {
        setUnidades(rs.unidades || []);
      })
      .catch(defaultProcessCatch());

    if (uuid) { 
      UnidadeAPI.unidadesUsuario(uuid)
        .then(rs => {
          setUnidadesValue(rs.unidades || [])
          return rs
        })
        .then(rs => {
          if (unidadesValue.length === unidades.length) return setTodasUnidades("todos")
          setTodasUnidades("escolher")
        })
        .catch(defaultProcessCatch)

      PerfilServiceApi.getUsuario(uuid)
        .then(rs => {
          setPerfisValue(rs.perfis || [])
        })
        .catch(defaultProcessCatch());

      UsuarioAPI.getUsuario(uuid)
        .then(rs => {
          setNome(rs.nome || '')
          setSobrenome(rs.sobrenome || '')
          setEmail(rs.email || '')
        })
        .catch(defaultProcessCatch());
    }
  }, [uuid, loggedUser.unidades]);

  const submit = () => {
    if (loading) return

    setLoading(true);
    if (uuid) {
      UsuarioAPI.update({usuario: {uuid, nome, sobrenome, email}, senha})
        .then(_ => { 
          const perfis = PerfilServiceApi.updateUsuario(uuid, {
            perfis_uuid: perfisValue.map(p => p.uuid)
          })

          const unidades = UnidadeAPI.updateUsuario(uuid, {
            unidades_uuid: unidadesValue.map(u => u.uuid)
          })

          Promise.all([perfis, unidades]).then(_ => {
            alerts.snackbars.success('Usuário atualizado com sucesso');
          })
          .catch(defaultProcessCatch(setErrors));
        })
        .finally(() => setLoading(false))
        .catch(defaultProcessCatch(setErrors));
    } else {
      UsuarioAPI.register({usuario: {nome, sobrenome, email}, senha})
        .then(rs => {
          const perfis = PerfilServiceApi.updateUsuario(rs.uuid, {
            perfis_uuid: perfisValue.map(p => p.uuid)
          })

          const unidades = UnidadeAPI.updateUsuario(rs.uuid, {
            unidades_uuid: unidadesValue.map(u => u.uuid)
          })

          Promise.all([perfis, unidades]).then(_ => {
            alerts.snackbars.success('Usuário criado com sucesso');
            setNome('');
            setSobrenome('');
            setPerfisValue([]);
            setEmail('');
            setSenha('');
          })
          .catch(defaultProcessCatch(setErrors));
        })
        .finally(() => setLoading(false))
        .catch(defaultProcessCatch(setErrors));
    }
  }

	return (
		<Page title={`Gestão de Usuários / Usuários / ${uuid ? "Atualizar" : "Criar"}`} className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title={`${uuid ? "Atualizar" : "Criar novo"} usuário`} />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											name="nome"
											label="Nome"
											value={nome}
                      onChange={setNome}
									    errorText={filterErrors(errors, 'nome')} />
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											name="sobrenome"
											label="Sobrenome"
											value={sobrenome}
                      onChange={setSobrenome}
									    errorText={filterErrors(errors, 'sobrenome')} />
									</Grid>	
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      errorText={filterErrors(errors, 'email')} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type="password"
                      name="senha"
                      label="Senha"
                      value={senha}
                      onChange={setSenha}
                      errorText={filterErrors(errors, 'senha')}/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
											multiple
											limitTags={4}
											value={perfisValue}
											options={perfis}
                      onChange={(_, perfis) => setPerfisValue(perfis)}
											getOptionLabel={option => option.nome}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Perfis" />
											)}
										/>
									</Grid> 
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RadioGroup
                      row
                      value={todasUnidades}
                      onChange={(_, v)=>setTodasUnidades(v)}>
                      <RadioGroupOption value={"todos"}>
                        Todas as unidades
                      </RadioGroupOption>
                      <RadioGroupOption value={"escolher"}>
                        Selecionar unidades
                      </RadioGroupOption>
                    </RadioGroup>
                    <Collapse in={todasUnidades === "escolher"} unmountOnExit>
                      <Autocomplete
                        multiple
                        limitTags={4}
                        value={unidadesValue}
                        options={unidades}
                        onChange={(_, unidades) => setUnidadesValue(unidades)}
                        getOptionLabel={option => option.codigo}
                        getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" label="Unidades" />
                        )}
                      />
                    </Collapse>
									</Grid>
                </Grid>
							</CardContent>
							<Divider />
							<CardActions className={classes.actions}>
								<Button disabled={loading} variant="contained" color="primary" onClick={submit}>Cadastrar</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
};

export default Cadastro;
