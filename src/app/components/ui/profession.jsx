import PropTypes from "prop-types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
    getProfessions,
    getProfessionsById,
    getProfessionsLoadingStatus,
    loadProfessionsList
} from "../../store/professions";

const Profession = ({ id }) => {
    const dispatch = useDispatch();
    const isLoading = useSelector(getProfessionsLoadingStatus());
    const prof = useSelector(getProfessionsById(id));
    useEffect(() => {
        dispatch(loadProfessionsList());
    }, []);
    if (!isLoading) {
        return <p>{prof.name}</p>;
    } else return "loading ...";
};
Profession.propTypes = {
    id: PropTypes.string
};
export default Profession;
