export default function HeaderMobile() {
  return (
    <div id="bbl_header_mobile" className="header-mobile bg-primary header-mobile-fixed">

			<a href="/">
				<img alt="Logo" src="/assets/media/logos/bbl-logos.png" className="max-h-30px" />
			</a>


			<div className="d-flex align-items-center">
				<button className="btn p-0 burger-icon burger-icon-left ml-4" id="bbl_header_mobile_toggle">
					<span></span>
				</button>
				<button className="btn p-2 ml-2" id="bbl_header_mobile_topbar_toggle">
        <i className="fad fa-user-alt"></i>
				</button>
			</div>

		</div>

  )
}
